import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "@/server/api/trpc";
import {env} from "@/env";

const productDBSchema = z.object({
    RETAILER_PRODUCT_ID: z.string(),
    RETAILER_PRODUCT_NAME: z.string().optional().nullable(),
    RETAILER_PRODUCT_URL: z.string().optional().nullable(),
    RETAILER_IMAGE: z.string().optional().nullable(),
    CATEGORY: z.string().optional().nullable(),
    DESCRIPTION: z.string().optional().nullable(),
    IMAGE_DESCRIPTION: z.string().optional().nullable(),
    RETAILER: z.string().optional().nullable(),
    AI_GENERATED_PRODUCT_DESCRIPTION: z.string().optional().nullable(),
});

export type ProductDBModel = z.infer<typeof productDBSchema>


const productSemanticSearchResults = z.object({
    numResults: z.number(),
    columns: z.array(z.string()),
    results: z.array(z.string()),
})

export type ProductSearchResults = z.infer<typeof productSemanticSearchResults>

const fetchData = async (searchQuery: string, numResults: number = 50) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${env.DATABRICKS_DATA_TOKEN}`);

    const raw = JSON.stringify({
        "num_results": numResults,
        "columns": [
            "Retailer_Product_ID"
        ],
        "query_text": searchQuery
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    return await fetch(`https://${env.DATABRICKS_DATA_SERVER_HOSTNAME}/api/2.0/vector-search/indexes/${env.DATABRICKS_VECTOR_INDEX_NAME}/query`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            const numResults = result["result"]["row_count"]
            const columns = result["manifest"]["columns"].map((col: any) => col["name"])
            const results = result["result"]["data_array"].map((row: any[]) => row[0])
            return productSemanticSearchResults.parse({
                numResults: numResults,
                columns: columns,
                results: results
            })
        })
        .catch((error) => console.error(error));
}

export const productRouter = createTRPCRouter({
    list: publicProcedure
        .query(async ({ctx}) => {
            const session = await ctx.sqlClient.openSession();
            const query = await session.executeStatement(
                `SELECT * 
                            FROM mars_data_day.products.product_details_vw 
                            ORDER BY RETAILER_PRODUCT_NAME 
                            LIMIT 10000`,
                {
                    maxRows: 10000 // This option enables the direct results feature.
                })
            const result = await query.fetchAll();
            await query.close()
            const resp = result.map((row) => productDBSchema.parse(row))
            await session.close()
            return resp
        }),
    search: publicProcedure
        .input(z.object({
            searchQuery: z.string(),
            numResults: z.number().optional().default(50)
        }))
        .query(async ({input}) => {
            if (input.searchQuery.length > 0) {
                return await fetchData(input.searchQuery, input.numResults)
            }
            return null
        })
})
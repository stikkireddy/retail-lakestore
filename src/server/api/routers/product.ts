import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "@/server/api/trpc";
import {env} from "@/env";
import {unstable_cache} from "next/cache";
import {DBSQLClient} from "@databricks/sql";

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
        "columns": env.DATABRICKS_VECTOR_INDEX_COLUMNS.split(","),
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

const getCachedProducts = unstable_cache(
    async () => {
        const client: DBSQLClient = new DBSQLClient();
        const connectOptions = {
            token: env.DATABRICKS_DATA_TOKEN,
            host:  env.DATABRICKS_DATA_SERVER_HOSTNAME,
            path:  env.DATABRICKS_DATA_HTTP_PATH
        };
        await client.connect(connectOptions)
        const session = await client.openSession();
        const query = await session.executeStatement(
            `SELECT * 
                            FROM ${env.DATABRICKS_PRODUCT_TABLE} 
                            ORDER BY RETAILER_PRODUCT_NAME 
                            LIMIT 10000`,
            {
                maxRows: 10000 // This option enables the direct results feature.
            })
        console.log("Fetched products from dbsql.")
        const result = await query.fetchAll();
        await query.close()
        const resp = result.map((row) => productDBSchema.parse(row))
        await session.close()
        return resp
    },
    ['products-list'],
);

export const productRouter = createTRPCRouter({
    list: publicProcedure
        .query(async () => {
            return await getCachedProducts()
        }),
    search: publicProcedure
        .input(z.object({
            searchQuery: z.string(),
            numResults: z.number().optional().default(10)
        }))
        .query(async ({input}) => {
            if (input.searchQuery.length > 0) {
                return await fetchData(input.searchQuery, input.numResults)
            }
            return null
        })
})

export const productSchema = z.object({
    RETAILER_PRODUCT_ID: z.string(),
    RETAILER_PRODUCT_NAME: z.string().optional(),
    RETAILER_PRODUCT_URL: z.string().optional(),
    RETAILER_IMAGE: z.string().optional(),
    CATEGORY: z.string().optional(),
    DESCRIPTION: z.string().optional(),
    IMAGE_DESCRIPTION: z.string().optional(),
    RETAILER: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;
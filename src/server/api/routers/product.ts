import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "@/server/api/trpc";
import {env} from "@/env";
import {unstable_cache} from "next/cache";
import {DBSQLClient} from "@databricks/sql";
import {TfIdf} from 'natural';

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
        });
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

const searchQuery = z.object({
    searchQuery: z.string(),
    numResults: z.number().default(10)
})

const getTFIDF = async () => {
        const tfidf = new TfIdf();
        const products = await getCachedProducts()
        products.forEach((product) => {
            if (product.RETAILER_PRODUCT_NAME) {
                tfidf.addDocument(product.RETAILER_PRODUCT_NAME.toLowerCase(), product.RETAILER_PRODUCT_ID)
            }
        })
        return tfidf
    }

const searchProducts = async (searchQuery: string, numResults: number = 10) => {
    const search = await getTFIDF()
    let scores: {i: number, measure: number, key: string | Record<string, any> | undefined}[] = []
    search.tfidfs(searchQuery.toLowerCase(), (i, measure, key) => {
        scores.push({i, measure, key})
    })
    scores = scores.sort((a, b) => b.measure - a.measure)
    scores = scores.slice(0, numResults).filter((score) => score.measure > 0)
    console.log("Computed text scores!")
    return productSemanticSearchResults.parse({
        numResults: scores.length,
        columns: ["RETAILER_PRODUCT_ID"],
        results: scores.map((score) => score.key as string)
    })
}

function rrf(results1: ProductSearchResults, results2: ProductSearchResults, m = 60, numResults: number) {
    const scores = new Map<string, number>()
    // this assumes that the results come in presorted in priority order
    const addScores = (array: string[], scoresMap: Map<string, number>) => {
        array.forEach((item, index) => {
            // start rank at 1
            const rank = index + 1;
            // if the score already exists lets redo the score
            const existingScore = scoresMap.get(item) || 0;
            // m is the ranking constant; go watch this video: https://www.youtube.com/watch?v=px4YBYrz0NU&ab_channel=OpenSourceConnections
            // if you want to learn more
            const rrfScore = 1 / (rank + m);
            scoresMap.set(item, existingScore + rrfScore);
        });
    };
    addScores(results1.results, scores)
    addScores(results2.results, scores)

    const results = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, numResults)
        .map((entry) => entry[0])

    return productSemanticSearchResults.parse({
        numResults: results.length,
        columns: ["RETAILER_PRODUCT_ID"],
        results: results
    })
}

export const productRouter = createTRPCRouter({
    list: publicProcedure
        .query(async () => {
            return await getCachedProducts()
        }),
    search: publicProcedure
        .input(searchQuery)
        .query(async ({input}) => {
            // fake hybrid search
            if (input.searchQuery.length > 0) {
                const textResults = await searchProducts(input.searchQuery, input.numResults)
                const semanticResults = await fetchData(input.searchQuery, input.numResults)
                return rrf(textResults, semanticResults, 60, input.numResults)
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
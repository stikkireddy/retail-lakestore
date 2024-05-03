import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "@/server/api/trpc";
import {unstable_cache} from "next/cache";
import {DBSQLClient} from "@databricks/sql";
import {env} from "@/env";


const forecastDBSchema = z.object({
    RETAILER_PRODUCT_ID: z.number(),
    WEEK: z.number(),
    UNITS_SOLD: z.number(),
    UNITS_ON_HAND: z.number(),
    STATUS: z.string().optional().nullable(),
    OUT_OF_STOCK: z.boolean().optional().nullable(),
});

export type ForecastDBModel = z.infer<typeof forecastDBSchema>


const getCachedForecast =   async () => {
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
                            FROM ${env.DATABRICKS_FORECAST_TABLE}`,
            )
        console.log("Fetched forecasts from dbsql.")
        const result = await query.fetchAll();
        await query.close()
        const resp = result.map((row) => forecastDBSchema.parse(row))
        await session.close()
        return resp
    }

const getSpecificForecast = unstable_cache(
    async (itemId: string) => {
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
                            FROM ${env.DATABRICKS_FORECAST_TABLE}
                            WHERE RETAILER_PRODUCT_ID = :itemId`,
            {
                maxRows: 10000,
                namedParameters: {
                    itemId: itemId
                }
            }
        )
        console.log("Fetched forecasts from dbsql.")
        const result = await query.fetchAll();
        await query.close()
        const resp = result.map((row) => forecastDBSchema.parse(row))
        await session.close()
        return resp
    },
    ['forecasts-list'],
);

// const getForecastData = async (): Promise<ForecastDBModel[]> => {
//     const results: ForecastDBModel[] = [];
//
//     return new Promise((resolve, reject) => {
//         fs.createReadStream('./forecasts/forecast.csv')
//             .pipe(csv())
//             .on('data', (data) => {
//                 try {
//                     const parsedData = forecastDBSchema.parse(data);
//                     results.push(parsedData);
//                 } catch (error) {
//                     reject(error);
//                 }
//             })
//             .on('end', () => {
//                 resolve(results);
//             });
//     });
// };

export const forecastRouter = createTRPCRouter({
    list: publicProcedure
        .query(async () => {
            return await getCachedForecast()
        }),
    get: publicProcedure
        .input(z.string())
        .query(async ({input}) => {
            // const data = await getCachedForecast();
            // return data.filter((item) => item.RETAILER_PRODUCT_ID === input)
            return getSpecificForecast(input)
        }),
})
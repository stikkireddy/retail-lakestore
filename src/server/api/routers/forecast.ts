import {z} from "zod";
import fs from 'fs';
import csv from 'csv-parser';
import {createTRPCRouter, publicProcedure} from "@/server/api/trpc";


const forecastDBSchema = z.object({
    RETAILER_PRODUCT_ID: z.string(),
    WEEK: z.string(),
    UNITS_SOLD: z.string(),
    UNITS_ON_HAND: z.string(),
    STATUS: z.string().optional().nullable(),
    OUT_OF_STOCK: z.string().optional().nullable(),
});

export type ForecastDBModel = z.infer<typeof forecastDBSchema>


const getForecastData = async (): Promise<ForecastDBModel[]> => {
    const results: ForecastDBModel[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream('./forecasts/forecast.csv')
            .pipe(csv())
            .on('data', (data) => {
                try {
                    const parsedData = forecastDBSchema.parse(data);
                    results.push(parsedData);
                } catch (error) {
                    reject(error);
                }
            })
            .on('end', () => {
                resolve(results);
            });
    });
};

export const forecastRouter = createTRPCRouter({
    list: publicProcedure
        .query(async () => {
            return await getForecastData()
        }),
    get: publicProcedure
        .input(z.string())
        .query(async ({input}) => {
            const data = await getForecastData();
            return data.filter((item) => item.RETAILER_PRODUCT_ID === input)
        }),
})
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';
import path from "node:path";

// Define your Zod data model
const productSchema = z.object({
    RETAILER_PRODUCT_ID: z.string(),
    RETAILER_PRODUCT_NAME: z.string().optional(),
    RETAILER_PRODUCT_URL: z.string().optional(),
    RETAILER_IMAGE: z.string().optional(),
    CATEGORY: z.string().optional(),
    DESCRIPTION: z.string().optional(),
    IMAGE_DESCRIPTION: z.string().optional(),
    RETAILER: z.string().optional(),
});

type Product = z.infer<typeof productSchema>;

export async function GET(req: Request) {
    const csvFilePath = path.join(process.cwd(), 'data', 'products_with_captions.csv');
    const data: Product[] = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
                try {
                    // Validate and parse each row of CSV data using Zod schema
                    const rowData = productSchema.parse(row);
                    data.push(rowData);
                } catch (error: any) {
                    // Handle validation errors
                    console.error('Error parsing row:', error.message);
                }
            })
            .on('end', () => {
                // Stream finished, resolve the promise
                resolve(null);
            })
            .on('error', (error) => {
                // Reject the promise if there's an error
                reject(error);
            });
    });

    return Response.json({
        products: data
    })
}
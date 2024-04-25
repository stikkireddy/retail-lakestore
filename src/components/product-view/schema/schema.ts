import { z } from "zod"


export const productSchema = z.object({
  url: z.string(),
  id: z.string(),
  name: z.string(),
  status: z.string(),
  price: z.number(),
  inventory: z.number(),
  totalSales: z.number(),
  createdAt: z.string(),
  labels: z.array(z.string()).optional(),
  imageDescription: z.string().optional(),
  providedDescription: z.string().optional(),
  retailer: z.string().optional(),
  aiGeneratedDescription: z.string().optional(),
})

export type Product = z.infer<typeof productSchema>
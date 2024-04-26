"use client"
import {Search,} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {ChangeEvent, useEffect, useState} from "react";
import {DataTable} from "@/components/product-view/table/data-table";
import {columns} from "@/components/product-view/table/columns";
import {Separator} from "@/components/ui/separator";
import {Product} from "@/components/product-view/schema/schema";
import {Skeleton} from "@/components/ui/skeleton";
import {api} from "@/trpc/react";
import {ProductDBModel} from "@/server/api/routers/product";

function useDebounce(value: string, delay: number) {
    // only update debounced value if value changes
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function dataToViewModel(data: ProductDBModel): Product {
    return {
        id: data.RETAILER_PRODUCT_ID,
        name: data.RETAILER_PRODUCT_NAME ?? "",
        status: "draft",
        price: 0,
        inventory: 0,
        totalSales: 0,
        createdAt: "2024-01-01",
        url: data.RETAILER_IMAGE ?? "",
        labels: data.CATEGORY ? [...data.CATEGORY.split(",")] : undefined,
        imageDescription: data.IMAGE_DESCRIPTION ?? "",
        providedDescription: data.DESCRIPTION ?? "",
        retailer: data.RETAILER ?? "",
        aiGeneratedDescription: data.AI_GENERATED_PRODUCT_DESCRIPTION ?? "",
    }
}

export function Dashboard() {
    const [_, setProductType] = useState("Draft")
    const [input, setInput] = useState("")
    const debouncedSearchTerm = useDebounce(input, 500);

    const [loadingProducts, setLoadingProducts] = useState(true)

    // products that get populated in table and some times filtered
    const [products, setProducts] = useState<Product[]>([])

    // products that get fetched from dbsql
    const {data, isLoading}  = api.product.list.useQuery()

    // search query results
    const {data: searchResults, isLoading: searchLoading } = api.product.search.useQuery({searchQuery:
        debouncedSearchTerm
    })

    useEffect(() => {
        if (searchLoading) {
            setLoadingProducts(true)
            return
        }
        // TODO a lot of this can be memoized
        if ((searchResults == null) && data) {
            const products = data.map(dataToViewModel)
            setProducts(products)
            setLoadingProducts(false)
        }
        if (searchResults && data) {
            const filderedProducts = searchResults.results.map((result) => {
                return data.find((product) => product.RETAILER_PRODUCT_ID === result) as ProductDBModel
            }).filter((v) => v != null).map((p) => {
                return dataToViewModel(p)
            })
            setProducts(filderedProducts)
            setLoadingProducts(false)
        }
    }, [searchLoading, data, isLoading, searchResults]);

    const loadingColumns = [...columns].map((column) => {
        const cellOnly = {
            cell : () => (
                <div className="flex flex-grow">
                    <Skeleton className="w-full h-[16px]"  />
                </div>
            )
        }
        // spread op to clone
        return {...column, ...cellOnly}
    })
    const loadingFakeData: Product[] = Array.from({ length: 50 }).map(() => ({
        id: "",
        url: "",
        name: "",
        status: "",
        price: 0,
        inventory: 0,
        totalSales: 0,
        createdAt: "",
    }))

    useEffect(
        () => {
            console.log("input", debouncedSearchTerm)
        },
        [debouncedSearchTerm]
    )

    useEffect(() => {
        if (isLoading || !data) return;
        const products = data.map(dataToViewModel)
        setProducts(products)
        setLoadingProducts(false)
    }, [isLoading]);

    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="Draft" onValueChange={setProductType}>
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="Active" disabled>Active</TabsTrigger>
                        <TabsTrigger value="Draft">Draft</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="Draft">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>
                                Manage your products and view their sales performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>

                                        <div className="relative ml-auto flex-1 md:grow-0 mb-2">
                                            <Search
                                                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                type="search"
                                                placeholder="Semantic Search..."
                                                className="w-full rounded-lg bg-background pl-8"
                                                onChangeCapture={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        Search powered by databricks vector database
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {debouncedSearchTerm && <div className="text-xs text-muted-foreground pb-4">
                                Showing <strong>1-10</strong> of <strong>{searchResults?.numResults}</strong>{" "}
                                products from search: {debouncedSearchTerm}
                            </div>}
                            <Separator/>
                            <div className={"pt-2"}>
                                <DataTable columns={loadingProducts ? loadingColumns : columns}
                                           data={loadingProducts ? loadingFakeData : products}/>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    )
}

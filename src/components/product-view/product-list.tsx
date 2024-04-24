"use client"
import Image from "next/image"
import Link from "next/link"
import {Search,} from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {ChangeEvent, useEffect, useState} from "react";
import {DataTable} from "@/components/product-view/table/data-table";
import {columns} from "@/components/product-view/table/columns";
import {Separator} from "@/components/ui/separator";
import {Product} from "@/components/product-view/schema/schema";
import {SideNav} from "@/components/nav/side-nav";
import {MobileNav} from "@/components/nav/mobile-nav";
import {signal} from "@preact/signals-react";
import {Skeleton} from "@/components/ui/skeleton";
import {z} from "zod";

function useDebounce(value: string, delay: number) {
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


export function Dashboard() {
    const [productType, setProductType] = useState("Draft")
    const [input, setInput] = useState("")
    const debouncedSearchTerm = useDebounce(input, 500);
    const [products, setProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)

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
        fetch("/api/product")
            .then((res) => res.json())
            .then((data) => {
                const products = data["products"].map((product: any) => {
                    return {
                        id: product["RETAILER_PRODUCT_ID"],
                        name: product["RETAILER_PRODUCT_NAME"],
                        status: "draft",
                        price: 0,
                        inventory: 0,
                        totalSales: 0,
                        createdAt: "2024-01-01",
                        url: product["RETAILER_IMAGE"],
                        labels: [product["CATEGORY"]],
                        imageDescription: product["IMAGE_DESCRIPTION"],
                        providedDescription: product["DESCRIPTION"],
                        retailer: product["RETAILER"],
                        // url: "https://www.google.com"
                    }
                })
                setProducts(products)
                setLoadingProducts(false)
            });
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <SideNav/>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header
                    className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <MobileNav/>
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="#">Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="#">Products</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{productType} Products</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="relative ml-auto flex-1 md:grow-0">
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="overflow-hidden rounded-full hover:bg-gray-500/20"
                            >
                                <Image
                                    src="/profile.png"
                                    width={36}
                                    height={36}
                                    alt="Avatar"
                                    className="overflow-hidden"
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                            <DropdownMenuItem disabled>Support</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem disabled>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
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
                                        Showing <strong>1-10</strong> of <strong>32</strong>{" "}
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
            </div>
        </div>
    )
}

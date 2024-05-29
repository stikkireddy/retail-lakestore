"use client"

import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet"
import {buttonVariants} from "@/components/ui/button";
import {dataToViewModel, useDebounce} from "@/components/product-view/product-list";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Product} from "@/components/product-view/schema/schema";
import {api} from "@/trpc/react";
import {ProductDBModel} from "@/server/api/routers/product";
import {Loader2} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import Image from "next/image";
import {Input} from "@/components/ui/input";
import {addToCartIfNotExists} from "@/components/cart-view/cart-list";

function SearchLoadingSkeleton(props: {nItems: number}) {
    const range =  []
    for (let i = 0; i < props.nItems; i++) {
        range.push(i)
    }
    return range.map((idx) => {
        return <div key={idx} className="flex items-center gap-4 p-2 transition-colors w-full">
            <Skeleton className="h-[72px] w-[72px]"/>
            <Skeleton className="h-[72px] w-full"/>
        </div>
    })
}

export function CartProductItem(props: {product: Product}) {
    return <>
        <Image
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="72"
            src={props.product.url}
            width="72"
            onLoad={() => <Skeleton className="w-[72px] h-[72px]"/>}
            loading={"lazy"}
        />
        {props.product.name}
    </>
}

export default function SearchProductView() {
    const [input, setInput] = useState("")
    const debouncedSearchTerm = useDebounce(input, 500);
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [products, setProducts] = useState<Product[]>([])
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



    return <Sheet>
        <SheetTrigger className={buttonVariants({variant: "default"})} disabled={isLoading}>
            {isLoading && <Loader2
                className={'h-4 w-4 mr-2 text-background/60 animate-spin'}
            />} Add Product
        </SheetTrigger>
        <SheetContent className="w-[50vw] sm:max-w-[50vw]">
            <SheetHeader>
                <SheetTitle>Search For your products</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full py-2 gap-2">
                <div className="flex-initial p-2">
                    <Input
                        type="search"
                        placeholder="Semantic Search..."
                        className="w-full rounded-lg bg-background pl-8 mt-2"
                        onChangeCapture={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                    />
                </div>
                <div className="flex-grow overflow-y-auto gap-2">
                    {searchLoading && <SearchLoadingSkeleton nItems={9}/>}
                    {!searchLoading && products && products.slice(0, 9).map((product, index) => <div
                        className="flex items-center gap-4 p-2 bg-background hover:bg-gray-500/10 cursor-pointer transition-colors w-full"
                        key={index}
                        onClick={() => {addToCartIfNotExists(product)}}
                    >
                        <CartProductItem product={product}/>
                    </div>)}
                </div>
            </div>
        </SheetContent>
    </Sheet>
}
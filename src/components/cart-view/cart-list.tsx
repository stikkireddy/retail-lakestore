"use client"

import {useSignals} from "@preact/signals-react/runtime";

import {Product} from "@/components/product-view/schema/schema";
import {signal} from "@preact/signals-react";
import {Button} from "@/components/ui/button";
import SearchProductView, {CartProductItem} from "@/components/cart-view/search-product-view";
import {z} from "zod";
import {useChat} from "ai/react";
import {FormEvent, useEffect, useState} from "react";
import {Message} from "ai";
import {productCopyPrompt} from "@/components/product-view/product-copy-edit-view";
import {api} from "@/trpc/react";
import {ProductDBModel} from "@/server/api/routers/product";
import {dataToViewModel} from "@/components/product-view/product-list";

export const cartView = signal<Product[]>([]);
export const recommendedProducts = signal<Product[]>([]);

export function emptyCart() {
    cartView.value = []
    recommendedProducts.value = []
}

export function addToCartIfNotExists(product: Product) {
    if (cartView.value?.find((p) => p.id === product.id) == null) {
        cartView.value = [...cartView.value, product]
    }
}

export function EmptyCartButton() {
    return <Button onClick={emptyCart}>Empty Cart</Button>
}

const recommendationPrompt = z.object({
    userPrompt: z.string(),
    systemPrompt: z.string(),
})

type RecommendationPrompt = z.infer<typeof recommendationPrompt>

export function makePrompt(products: Product[]) {
    const systemPrompt = `You are an AI assistant functioning as a recommendation system for an ecommerce website.
    Be specific and limit your answers to the requested format.
    `
    const productsString = products.map((product) => {
        return `${product.name} - ${product.imageDescription}`
    }).join("\n")
    const userPrompt = `Given the following products in the cart, recommend a product that the user might like. 
    Express your response as a JSON object with a key of 'next_items' and an array of string which is a list of brief item descriptions, category, and color the user may want. 
    Try to be specific and not general. Try to avoid recommending categories that are already selected in the cart, try to give complimentary recommendations.
     Do not use brand names in the response. Keep in mind the store only footwear, pants, shorts, shirts. Stick to one: Men's, Women's or Kid's clothing. Only respond the JSON nothing else!
     
     Avoid recommending the same product category that is already in the cart.
     For example if there are shoes in the cart avoid recommending shoes.
     Stick to one gender for your searches. If the selected item is boys stick to boys and if its women stick to women.
     Do not provide same category of items!
     Ensure response is valid json and just json!
     The cart contains: ${productsString}
     The recommendations are:
    `

    return recommendationPrompt.parse({
        userPrompt: userPrompt,
        systemPrompt: systemPrompt
    })
}


export function CartList() {
    useSignals()
    return <div className="flex w-full">
        <div>
            <p>Items in Cart:</p>
            <div className="flex flex-col gap-4 pt-2 w-full">
            {
                cartView.value?.map((product, index) => {
                    return <div key={index}
                                className="flex items-center gap-4 p-2 bg-background hover:bg-gray-500/10 transition-colors w-full">
                        <CartProductItem product={product}/>
                    </div>
                })
            }
            </div>
        </div>
    </div>
}

export function CartView() {
    useSignals()
    const {messages, input, reload, setInput, setMessages, isLoading, handleSubmit} = useChat({
        api: `/api/chat/databricks-dbrx-instruct`,
        streamMode: "stream-data",
    });
    useEffect(() => {
        console.log("cart view value changed")
        if (cartView.value && cartView.value.length > 0) {
            console.log("reached here")
            const prompt = makePrompt(cartView.value)
            const msgs = [{
                id: "1",
                role: "system",
                content: prompt.systemPrompt
            }] as Message[]
            setMessages(msgs)
            setInput(prompt.userPrompt)
        }
    }, [cartView.value]);

    useEffect(() => {
        if (input != null && input.length > 0) {
            const fakeEvent = {
                preventDefault: () => {
                }, // Define preventDefault if needed
                target: {value: productCopyPrompt.value} // Simulate target value
            } as unknown as FormEvent<HTMLFormElement>;
            handleSubmit(fakeEvent)
        }
    }, [input, messages])

    const [searchString, setSearchString] = useState("")
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
    const lastMessageContent = lastMessage && lastMessage.role == "assistant" ? lastMessage.content : ""
    useEffect(() => {
        if (isLoading) {
            recommendedProducts.value = []
        }
        if (!isLoading && messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.role == "assistant") {
                try {
                    const nextItems = JSON.parse(lastMessage.content).next_items
                    setSearchString(nextItems.join(", "))
                } catch (e) {
                    console.log(lastMessage.content)
                    console.log(typeof lastMessage.content)
                    console.error(e)
                }
            }
        }
    }, [isLoading, lastMessageContent]);


    return <div className="flex">
        <div className="flex-1 p-4">
            <div className="flex justify-end gap-2">
                <SearchProductView/>
                <EmptyCartButton/>
            </div>
            <CartList/>
        </div>
        <div className="flex-1 p-4">
            {/*{cartView.value && makePrompt(cartView.value).systemPrompt}*/}
            {/*{cartView.value && makePrompt(cartView.value).userPrompt}*/}
            {isLoading && <p>Loading...</p>}
            {!isLoading && cartView && cartView.value && cartView.value.length > 0 && searchString && searchString.length > 0 &&
                <p>Search Topics: {searchString}</p>}
            <div className={"mt-2"}>
            {cartView && cartView.value && cartView.value.length > 0 && searchString && searchString.length > 0 &&
                <CartRecommendations searchString={searchString}/>}
            </div>
        </div>
    </div>

}

function CartRecommendations({searchString}: {searchString: string}) {
    useSignals()
    const {data: searchResults, isLoading: searchLoading } = api.product.search.useQuery({searchQuery:
        searchString
    })
    // const [products, setProducts] = useState<Product[]>([])
    const {data, isLoading}  = api.product.list.useQuery()


    useEffect(() => {
        if (searchLoading) {
            // setProducts([])
            recommendedProducts.value = []
        }
        if (searchResults && data) {
            const filderedProducts = searchResults.results.slice(0, 5).map((result) => {
                return data.find((product) => product.RETAILER_PRODUCT_ID === result) as ProductDBModel
            }).filter((v) => v != null).map((p) => {
                return dataToViewModel(p)
            })
            recommendedProducts.value = filderedProducts
        }
    }, [searchResults, searchLoading, data, isLoading]);

    return <div>
        {searchLoading && <p>Searching for Recommendations...</p>}
        <div>
            {recommendedProducts.value && recommendedProducts.value.length > 0 && <p>Recommended Items For Cart:</p>}
            <div className="flex flex-col gap-4 pt-2 w-full">
                {
                    !searchLoading && recommendedProducts.value.map((product, index) => {
                        return <div key={index}
                                    className="flex items-center gap-4 p-2 bg-background hover:bg-gray-500/10 transition-colors w-full">
                            <CartProductItem product={product}/>
                        </div>
                    })
                }
            </div>
        </div>
    </div>

}
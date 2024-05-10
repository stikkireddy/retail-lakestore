"use client";
import ProductImages from "@/components/product-view/product-images";
import ProductDetails from "@/components/product-view/product-details";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {computed, effect, signal} from "@preact/signals-react";
import {useSignals} from "@preact/signals-react/runtime";
import {Product} from "@/components/product-view/schema/schema";
import {useChat} from "ai/react";
import React, {FormEvent, useEffect} from "react";
import {Loader2} from "lucide-react";
import {Message} from "ai";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";


export const openSignal = signal<Product | null>(null);
export const productCopyPrompt = signal<string>("Please make a brief product description; at most two sentences. " +
    "Product Title: {title} " +
    "Product Caption: {caption} " +
    "Product Category: {category}")
const generationLoadingSignal = signal<number>(0)
const selectedModel = signal<string>("databricks-dbrx-instruct")

type Model = {
    label: string
    value: string
}

const models: Model[] = [
    {
        label: "DBRX",
        value: "databricks-dbrx-instruct"
    },
    {
        label: "Llama 2 70b",
        value: "databricks-llama-2-70b-chat"
    },
    // {
    //     label: "Llama 3 70b",
    //     value: "databricks-meta-llama-3-70b-instruct"
    // },
    {
        label: "Mixtral 8x7b",
        value: "databricks-mixtral-8x7b-instruct"
    }
]


export function ProductEditModal() {
    useSignals()
    const open = computed(() => {
        return openSignal.value !== null && openSignal.value !== undefined
    })
    const setOpenF = (open: boolean) => {
        if (!open) {
            openSignal.value = null
        }
    }
    return <Dialog open={open.value} onOpenChange={setOpenF}>
        <DialogContent className={"min-w-[1150px] max-h-[850px] overflow-y-scroll"}>
            <ProductEditView/>
        </DialogContent>
    </Dialog>
}

export function ProductCopyPrompt() {
    useSignals()
    return <>
        <Label htmlFor="generation-1">Prompt</Label>
        <Textarea
            id="generation-1"
            defaultValue={productCopyPrompt.value}
            className="min-h-16"
            value={productCopyPrompt.value}
            onChange={(e) => {
                productCopyPrompt.value = e.target.value
            }}
        />
    </>
}

export default function ProductEditView() {
    useSignals()
    const [generateAll, setGenerateAll] = React.useState<boolean>(false)
    React.useEffect(() => {
        if (generateAll) {
            // Reset the state after a delay of 1 second
            const timer = setTimeout(() => {
                setGenerateAll(false);
            }, 10);

            return () => clearTimeout(timer);
        }
    }, [generateAll]);

    const [finalDescription, setFinalDescription] = React.useState<string>("")

    const [finalDescriptionLoading, setFinalDescriptionLoading] = React.useState<boolean>(false)

    const onClick = async () => {
        if (finalDescription && openSignal.value) {
            setFinalDescriptionLoading(true)
            if (openSignal.value.providedDescription !== finalDescription) {
                openSignal.value.providedDescription = finalDescription
            }
            setTimeout(() => {
                setAccordionValue("product-details")
                setFinalDescriptionLoading(false)
            }, 1000)
        }
    }

    const [accordionValue, setAccordionValue] = React.useState<string>("product-details")



    return (
        <Accordion type="single" defaultValue="product-details"
                   value={accordionValue}
                     onValueChange={(value) => {
                          setAccordionValue(value)
                     }}
                   collapsible>
            <AccordionItem value="product-details">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-8 gap-2 py-4">
                        <div className="col-span-2">
                            <ProductImages/>
                        </div>
                        <div className="col-span-6">
                            <ProductDetails/>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="product-copy">
                <AccordionTrigger>Live Product Copy Generation</AccordionTrigger>
                <AccordionContent>
                    <Card className="w-full h-full">
                        <CardHeader>
                            <CardTitle>
                                <div className="flex justify-between">
                                    <p>Product Copy Generations</p>
                                    <Button type="submit" onClick={(e) => {
                                        generationLoadingSignal.value = 3
                                        setGenerateAll(true)
                                    }} disabled={generationLoadingSignal.value > 0}>
                                        {generationLoadingSignal.value > 0 ? <Loader2
                                            className={'h-4 w-4 mr-2 text-background/60 animate-spin'}
                                        /> : null}
                                        Regenerate All
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={"flex flex-col gap-4"}>
                                <div className="grid gap-3 col-span-4">
                                    <ProductCopyPrompt/>
                                </div>
                                <div className="grid gap-3 col-span-4">
                                    <Label htmlFor="model">Model</Label>
                                    <Select defaultValue={models[0].value} onValueChange={(value) => {
                                        selectedModel.value = value
                                    }}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {...models.map((model) => (
                                                <SelectItem key={model.value} value={model.value}>
                                                    {model.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="grid gap-3 col-span-4">
                                        <ProductCopyGeneration title={"Generation 1"}
                                                               parentTriggerGenerate={generateAll}
                                        />
                                    </div>
                                    <div className="grid gap-3 col-span-4">
                                        <ProductCopyGeneration title={"Generation 2"}
                                                               parentTriggerGenerate={generateAll}
                                        />
                                    </div>
                                    <div className="grid gap-3 col-span-4">
                                        <ProductCopyGeneration title={"Generation 3"}
                                                               parentTriggerGenerate={generateAll}/>
                                    </div>
                                </div>
                                <Label htmlFor="final-description">Final Description</Label>
                                <Textarea
                                    id="final-description"
                                    className="min-h-32"
                                    // defaultValue={finalDescription}
                                    value={finalDescription}
                                    onChange={(e) => {
                                        setFinalDescription(e.target.value)
                                    }}
                                />
                                <Button
                                    onClick={onClick}
                                    disabled={finalDescriptionLoading}
                                >
                                    {finalDescriptionLoading && <Loader2
                                        className={'h-4 w-4 mr-2 text-background/60 animate-spin'}
                                    />}
                                    Save Description
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export function ProductCopyGeneration(
    {
        title,
        parentTriggerGenerate = false,
    }: {
        title: string
        parentTriggerGenerate?: boolean
    }) {
    useSignals()
    const [finished, setFinished] = React.useState<boolean>(true)
    const {messages, input, setInput, setMessages, isLoading, handleSubmit} = useChat({
        api: `/api/chat/${selectedModel.value}`,
        onFinish: (messages) => {
            setFinished(true)
        }
    });
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
    const lastMessageContent = lastMessage && lastMessage.role == "assistant" ? lastMessage.content : ""
    const numWords = lastMessageContent.split(" ").length - 1
    const numChars = lastMessageContent.length
    const numTokensString = numWords > 0 ? `(${numChars} Characters, ${numWords} Words)` : ""

    const systemMessage: Message = {
        id: "1",
        role: "system",
        content: "You are friendly, playful assistant providing a useful description of this product based on supplied characteristics. " +
            "Keep your answers to 100 words or less. Do not use emojis in your response.",
    }

    // loading effect
    useEffect(() => {
        if (!isLoading) {
            generationLoadingSignal.value -= 1
        }
    }, [isLoading]);

    // generate global button
    useEffect(() => {
        if (parentTriggerGenerate) {
            setMessages([systemMessage])
            const prompt = productCopyPrompt.value
                .replace("{title}", openSignal.value?.name ?? "No product title")
                .replace("{caption}", openSignal.value?.imageDescription ?? "No product caption")
                .replace("{category}", openSignal.value?.labels?.join(" ") ?? "No product labels")
            console.log(prompt)
            setInput(prompt)
        }
    }, [parentTriggerGenerate]);

    // local button
    useEffect(() => {
        if (input.length > 0) {
            setMessages([systemMessage])
            const fakeEvent = {
                preventDefault: () => {
                }, // Define preventDefault if needed
                target: {value: productCopyPrompt.value} // Simulate target value
            } as unknown as FormEvent<HTMLFormElement>;
            setFinished(false)
            handleSubmit(fakeEvent)
        }
    }, [input]);

    return <>
        <Label htmlFor={title}>{title} {numTokensString}</Label>
        <Textarea
            id={title}
            defaultValue={lastMessageContent}
            className="min-h-72"
            disabled
        />
        <Button
            disabled={generationLoadingSignal.value > 0}
            onClick={(e) => {
            setMessages([systemMessage])
            const prompt = productCopyPrompt.value
                .replace("{title}", openSignal.value?.name ?? "No product title")
                .replace("{caption}", openSignal.value?.imageDescription ?? "No product caption")
                .replace("{category}", openSignal.value?.labels?.join(" ") ?? "No product labels")
            console.log(prompt)
            setInput(prompt)
            generationLoadingSignal.value = 1
        }}>
            {!finished && generationLoadingSignal.value > 0 ? <Loader2
                className={'h-4 w-4 mr-2 text-background/60 animate-spin'}
            /> : null}
            Regenerate</Button>
    </>
}
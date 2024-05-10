"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {useSignals} from "@preact/signals-react/runtime";
import {openSignal} from "@/components/product-view/product-copy-edit-view";

export default function ProductDetails() {
    useSignals()
    const title = openSignal.value?.name
    const description = openSignal.value?.providedDescription ?? "No description provided."
    const aiGeneratedDescription = openSignal.value?.aiGeneratedDescription ?? "No AI generated description available."
    const labelString = `Labels: ${(openSignal.value?.labels?.join(",") ?? "")}, Product ID: ${openSignal.value?.id}, Retailer: ${openSignal.value?.retailer}`
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                    Product Details and Metadata
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            className="w-full"
                            defaultValue={title}
                            disabled
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            defaultValue={description}
                            className="h-16"
                            disabled
                        />
                    </div>
                    <div className="grid gap-3 hidden">
                        <Label htmlFor="aiDescription">AI Generated Description</Label>
                        <Textarea
                            id="aiDescription"
                            defaultValue={aiGeneratedDescription}
                            className="h-16"
                            disabled
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description">Metadata</Label>
                        <Textarea
                            id="description"
                            defaultValue={labelString}
                            className="min-h-8"
                            disabled
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}



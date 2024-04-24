"use client";
import Image from "next/image"

import {Card, CardContent,} from "@/components/ui/card"
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useSignals} from "@preact/signals-react/runtime";
import {openSignal} from "@/components/product-view/product-copy-edit-view";

export default function ProductImages() {
    useSignals()
    const imageUrl = openSignal.value?.url
    const caption = openSignal.value?.imageDescription
    return (
        <Card className="h-full">
            <CardContent className={"h-full"}>
                <div className="flex flex-col gap-2 h-full">
                    {imageUrl ? <Image
                        alt="Product image"
                        className="aspect-square w-full rounded-md object-cover"
                        height="300"
                        src={imageUrl}
                        width="300"
                    /> : null}
                    <div className="flex gap-2 h-full">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="description">Image Caption:</Label>
                            <Textarea
                                id="description"
                                defaultValue={caption}
                                className="h-full"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

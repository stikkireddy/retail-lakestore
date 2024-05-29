"use client"

import {useRouter} from "next/navigation";
import {useEffect} from "react";

export function HomeRedirect() {
    const router = useRouter()

    useEffect(() => {
        router.push("/products")
    }, [])

    return <>
    </>
}
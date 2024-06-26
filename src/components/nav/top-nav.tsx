"use client"
import {MobileNav} from "@/components/nav/mobile-nav";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {usePathname} from "next/navigation";

export function ProductsCrumbs(props: {productType: string}) {
    return <>
    <BreadcrumbItem>
        <BreadcrumbLink asChild>
            <Link href="#">Products</Link>
        </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator/>
    <BreadcrumbItem>
        <BreadcrumbPage>{props.productType} Products</BreadcrumbPage>
    </BreadcrumbItem></>
}

export function CartCrumbs() {
    return <>
        <BreadcrumbItem>
            <BreadcrumbLink asChild>
                <Link href="#">Cart</Link>
            </BreadcrumbLink>
        </BreadcrumbItem>
    </>

}

export function TopNav(props: { productType: string }) {
    const pathname = usePathname()
    const isCart = pathname === "/cart"
    const isProduct = pathname === "/products"
    return <>
        <MobileNav/>
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="#">Dashboard</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                {isProduct && <ProductsCrumbs productType={props.productType}/>}
                {isCart && <CartCrumbs/>}
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
    </>;
}
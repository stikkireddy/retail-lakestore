import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Home, LineChart, Package, PanelLeft, ShoppingCart, Users2} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MobileNav() {
    return <Sheet>
        <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5"/>
                <span className="sr-only">Toggle Menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                    href="#"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                    <Image
                        src="/logo_dark.png"
                        width={36}
                        height={36}
                        alt="Logo"
                        className="overflow-hidden"
                    />
                    <span className="sr-only">Lakestore</span>
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <Home className="h-5 w-5"/>
                    Dashboard
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <ShoppingCart className="h-5 w-5"/>
                    Orders
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-2.5 text-foreground"
                >
                    <Package className="h-5 w-5"/>
                    Products
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <Users2 className="h-5 w-5"/>
                    Customers
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <LineChart className="h-5 w-5"/>
                    Settings
                </Link>
            </nav>
        </SheetContent>
    </Sheet>;
}
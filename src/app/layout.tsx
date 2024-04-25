import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "../styles/globals.css";
import {TRPCReactProvider} from "@/trpc/react";
import {SideNav} from "@/components/nav/side-nav";
import {TopNav} from "@/components/nav/top-nav";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Lakestore",
    description: "Example retail store built by Databricks",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>

        <TRPCReactProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                    <SideNav/>
                </aside>
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <header
                        className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <TopNav productType={"Draft"}/>
                    </header>
                    {children}
                </div>
            </div>
        </TRPCReactProvider>
        </body>
        </html>
);
}

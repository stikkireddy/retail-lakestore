"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Product} from "@/components/product-view/schema/schema"
import {DataTableColumnHeader} from "./data-table-column-headers"
import {DataTableRowActions} from "./data-table-row-actions"
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";

export const columns: ColumnDef<Product>[] = [
    {
        id: "url",
        header: ({ table }) => (
            <></>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
            <Image
                alt="Product image"
                className="aspect-square rounded-md object-cover"
                height="72"
                // src="http://assets.myntassets.com/v1/images/style/properties/416f7bd57546242fd72a817de0d517e5_images.jpg"
                src={row.original.url}
                width="72"
                onLoad={() => <Skeleton className="w-[72px] h-[72px]" />}
                loading={"lazy"}
            />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Product Title"/>
        ),
        cell: ({row}) => <div className="w-[280px]">{row.getValue("name")}</div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "labels",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Labels"/>
        ),
        cell: ({row}) => {
            if (row.getValue("labels") === null) {
                return <div className="w-[80px]"></div>
            }
            const labels = row.getValue("labels") as string[]
            const labelBadges = labels.map((label, idx) => <Badge key={idx}
                                                                  className={"m-1"} variant="outline">{label}</Badge>)
            return <div className="w-[180px]">{...labelBadges}</div>
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Status"/>
        ),
        cell: ({row}) => <div className="w-[80px]">{row.getValue("status")}</div>,
        enableSorting: false,
        enableHiding: false,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "retailer",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Retailer"/>
        ),
        cell: ({row}) => <div className="w-[130px]">
            <p className={"truncate"}> {row.getValue("retailer")} </p>
        </div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "createdAt",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Created At"/>
        ),
        cell: ({row}) => <div className="w-[80px]">
            {row.getValue("createdAt")}
        </div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "actions",
        cell: ({row}) => <DataTableRowActions row={row}/>,
    },
]
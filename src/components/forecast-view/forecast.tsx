import {computed, signal} from "@preact/signals-react";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import React from "react";
import {useSignals} from "@preact/signals-react/runtime";
import {api} from "@/trpc/react";
import ReactECharts from 'echarts-for-react';
import {ForecastDBModel} from "@/server/api/routers/forecast";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Product} from "@/components/product-view/schema/schema";


export const displayForecastSignal = signal<Product | null>(null);

export function ProductForecastModal() {
    useSignals()
    const open = computed(() => {
        return displayForecastSignal.value !== null && displayForecastSignal.value !== undefined
    })
    const setOpenF = (open: boolean) => {
        if (!open) {
            displayForecastSignal.value = null
        }
    }
    return <Dialog open={open.value} onOpenChange={setOpenF}>
        <DialogContent className={"min-w-[1150px] max-h-[850px] overflow-y-scroll"}>
            {displayForecastSignal.value?.id && <Card className={"mt-4"}>
                <CardHeader>
                    <CardTitle>
                        {displayForecastSignal.value?.name} Forecast
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={"m-8"}>
                        <ForecaseViz productId={displayForecastSignal.value?.id}/>
                    </div>
                </CardContent>
            </Card>}
        </DialogContent>
    </Dialog>
}

export function ForecaseViz({productId}: {
    productId: string
}) {
    const {data, isLoading} = api.forecast.get.useQuery(productId)
    if (isLoading) {
        // return <div>Loading...</div>
        return <div className="flex justify-center items-center">
            <span className="text-4xl dot animate-dot">.</span>
            <span className="text-4xl dot animate-dot" style={{animationDelay: '0.2s'}}>.</span>
            <span className="text-4xl dot animate-dot" style={{animationDelay: '0.4s'}}>.</span>
        </div>
    }
    if (!data) {
        return <div>No data</div>
    }

    const createSeries = (data: ForecastDBModel[], forecastType: string) => {
        return {
            weeks: data.map(item => `Week ${item.WEEK}`),
            unitsSold: data.map(item => item.STATUS == forecastType ? parseInt(item.UNITS_SOLD) : null),
            unitsOnHand: data.map(item => item.STATUS == forecastType ? parseInt(item.UNITS_ON_HAND) : null),
            outOfStock: data.map(item => item.OUT_OF_STOCK === "true")
        };
    };
    const actuals = createSeries(data, "actuals");
    const forecast = createSeries(data, "forecast");

    console.log("actuals", actuals)
    console.log("forecast", forecast)
    const options = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['Units Sold - Actuals', 'Units On Hand - Actuals', 'Units Sold - Forecast', 'Units On Hand - Forecast']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: actuals.weeks
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Units Sold - Actuals',
                type: 'line',
                data: actuals.unitsSold,
                itemStyle: { color: '#ff6666' }
            },
            {
                name: 'Units On Hand - Actuals',
                type: 'line',
                data: actuals.unitsOnHand,
                itemStyle: { color: '#ffcc66' }
            },
            {
                name: 'Units Sold - Forecast',
                type: 'line',
                data: forecast.unitsSold,
                itemStyle: { color: '#6666ff' },
                lineStyle: { type: 'dashed' }
            },
            {
                name: 'Units On Hand - Forecast',
                type: 'line',
                data: forecast.unitsOnHand,
                itemStyle: { color: '#66ccff' },
                lineStyle: { type: 'dashed' }
            }
        ]
    };

    return <ReactECharts option={options} />;
}
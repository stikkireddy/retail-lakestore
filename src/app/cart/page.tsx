import SearchProductView from "@/components/cart-view/search-product-view";
import {CartList, CartView, EmptyCartButton} from "@/components/cart-view/cart-list";


export default function Cart() {
    return <CartView/>
    // return <div className="grid grid-cols-9 gap-4 p-4">
    //     <div className="col-span-2">
    //         <SearchProductView/>
    //         <EmptyCartButton/>
    //         <CartList/>
    //     </div>
    // </div>
}
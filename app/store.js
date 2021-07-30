import { configureStore } from "@reduxjs/toolkit";

import appSlice from "../features/app/appSlice";
import cartReducer from "../features/cart/cartSlice";
import manageprodcutsReducer from "../features/manageproducts/manageprodcutsSlice";
import ordersSlice from "../features/orders/ordersSlice";
import productsReducer from "../features/products/productsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    manageproducts: manageprodcutsReducer,
    cart: cartReducer,
    app: appSlice,
    orders: ordersSlice,
  },
});

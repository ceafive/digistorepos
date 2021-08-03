import { configureStore } from "@reduxjs/toolkit";

import productsReducer from "../features/products/productsSlice";
import cartReducer from "../features/cart/cartSlice";
import appSlice from "../features/app/appSlice";
import salesSlice from "features/sales/salesSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    app: appSlice,
    sales: salesSlice,
  },
});

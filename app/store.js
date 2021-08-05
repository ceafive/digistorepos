import { configureStore } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";

import appSlice from "../features/app/appSlice";
import cartReducer from "../features/cart/cartSlice";
import manageprodcutsReducer from "../features/manageproducts/manageprodcutsSlice";
import ordersSlice from "../features/orders/ordersSlice";
import productsReducer from "../features/products/productsSlice";

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const rootReducer = {
  products: productsReducer,
  manageproducts: manageprodcutsReducer,
  cart: cartReducer,
  app: appSlice,
  orders: ordersSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  enhancers: [sentryReduxEnhancer],
});

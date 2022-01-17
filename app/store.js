import { configureStore } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";

// import logger from "redux-logger";
import appReducer from "../features/app/appSlice";
import cartReducer from "../features/cart/cartSlice";
import customersReducer from "../features/customers/customersSlice";
import manageproductsReducer from "../features/manageproducts/manageproductsSlice";
import ordersReducer from "../features/orders/ordersSlice";
import productsReducer from "../features/products/productsSlice";

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const rootReducer = {
  products: productsReducer,
  manageproducts: manageproductsReducer,
  cart: cartReducer,
  app: appReducer,
  orders: ordersReducer,
  customers: customersReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  enhancers: [sentryReduxEnhancer],
});

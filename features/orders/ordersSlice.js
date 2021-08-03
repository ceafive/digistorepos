import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderHistory: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    onAppResetSales() {
      return initialState;
    },
    setOrderHistory(state, action) {
      state.orderHistory = action.payload;
    },
  },
});

export const { setOrderHistory, onAppResetSales } = ordersSlice.actions;
export default ordersSlice.reducer;

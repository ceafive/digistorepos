import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salesHistory: [],
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    onAppResetSales() {
      return initialState;
    },
    setSalesHistoryitem(state, action) {
      state.salesHistory = [...action.payload, ...[]];
    },
  },
});

export const { setSalesHistoryitem, onAppResetSales } = salesSlice.actions;
export default salesSlice.reducer;

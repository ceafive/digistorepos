import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salesHistory: [],
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setSalesHistoryitem(state, action) {
      state.salesHistory = [...action.payload, ...[]];
    },
  },
});

export const { setSalesHistoryitem } = salesSlice.actions;
export default salesSlice.reducer;

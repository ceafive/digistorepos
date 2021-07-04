import { createSlice } from "@reduxjs/toolkit"
import salesHistory from "data/mock_sales_history"

const initialState = {
  salesHistory: []
}

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setSalesHistoryitem(state, action) {
      state.salesHistory = [...action.payload, ...salesHistory]
    }
  }
})

export const { setSalesHistoryitem } = salesSlice.actions
export default salesSlice.reducer

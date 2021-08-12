import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allCustomers: [],
};

const actionCreator = (key, state, payload) => {
  return (state[key] = payload);
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setAllCustomers(state, action) {
      state.allCustomers = action.payload;
    },
  },
});

export const { setAllCustomers } = customersSlice.actions;
export default customersSlice.reducer;

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
    onAppResetCustomers() {
      return initialState;
    },
    setAllCustomers(state, action) {
      state.allCustomers = action.payload;
    },
  },
});

export const { setAllCustomers, onAppResetCustomers } = customersSlice.actions;
export default customersSlice.reducer;

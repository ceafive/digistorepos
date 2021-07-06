import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productHasVariants: false,
  productWithVariants: [],
};

const actionCreator = (key, state, payload) => {
  return (state[key] = payload);
};

const manageproductsSlice = createSlice({
  name: "manageproducts",
  initialState,
  reducers: {
    setProductWithVariants(state, action) {
      actionCreator("productWithVariants", state, action?.payload);
    },
    setProductHasVariants(state) {
      actionCreator("productHasVariants", state, !state.productHasVariants);
    },
  },
});

export const { setProductHasVariants, setProductWithVariants } = manageproductsSlice.actions;
export default manageproductsSlice.reducer;

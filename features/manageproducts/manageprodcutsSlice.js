import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productHasVariants: false,
  productWithVariants: [],
  manageProductCategories: [],
  manageProductProducts: [],
};

const actionCreator = (key, state, payload) => {
  return (state[key] = payload);
};

const manageproductsSlice = createSlice({
  name: "manageproducts",
  initialState,
  reducers: {
    setManageProductProducts(state, action) {
      actionCreator("manageProductProducts", state, action?.payload);
    },
    setManageProductCategories(state, action) {
      actionCreator("manageProductCategories", state, action?.payload);
    },
    setProductWithVariants(state, action) {
      actionCreator("productWithVariants", state, action?.payload);
    },
    setProductHasVariants(state) {
      actionCreator("productHasVariants", state, !state.productHasVariants);
    },
  },
});

export const { setProductHasVariants, setProductWithVariants, setManageProductCategories, setManageProductProducts } =
  manageproductsSlice.actions;
export default manageproductsSlice.reducer;

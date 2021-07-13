import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productHasVariants: false,
  productWithVariants: {},
  manageProductCategories: [],
  manageProductProducts: [],
  manageProductOutlets: [],
  showAddCategoryModal: false,
};

const actionCreator = (key, state, payload) => {
  return (state[key] = payload);
};

const manageproductsSlice = createSlice({
  name: "manageproducts",
  initialState,
  reducers: {
    setShowAddCategoryModal(state) {
      actionCreator("showAddCategoryModal", state, !state.showAddCategoryModal);
    },
    setManageProductOutlets(state, action) {
      actionCreator("manageProductOutlets", state, action?.payload);
    },
    setManageProductProducts(state, action) {
      actionCreator("manageProductProducts", state, action?.payload);
    },

    setManageProductCategories(state, action) {
      actionCreator("manageProductCategories", state, action?.payload);
    },
    setProductWithVariants(state, action) {
      actionCreator("productWithVariants", state, action?.payload);
    },
    setProductHasVariants(state, action) {
      actionCreator(
        "productHasVariants",
        state,
        action?.payload === true || action?.payload === false ? action.payload : !state.productHasVariants
      );
    },
  },
});

export const {
  setProductHasVariants,
  setProductWithVariants,
  setManageProductCategories,
  setManageProductProducts,
  setManageProductOutlets,
  setShowAddCategoryModal,
} = manageproductsSlice.actions;
export default manageproductsSlice.reducer;

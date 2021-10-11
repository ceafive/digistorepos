import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  outlets: [],
  products: [],
  searchTerm: "",
  inventoryModalOpen: false,
  productModalOpen: false,
  productToView: null,
  customers: [],
  productCategories: [],
  categorySelected: {
    product_category_id: "ALL",
    product_category: "ALL",
    product_category_description: "All Categories",
  },
  categoryProductsCount: [],
  productsOnHold: false,
  productWithVariantsOpen: false,
};

const actionCreator = (key, state, payload) => {
  return (state[key] = payload);
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    onAppResetProducts() {
      return initialState;
    },
    setProductsOnHold(state) {
      state.productsOnHold = !state.productsOnHold;
    },
    setCategoryProductsCount(state, action) {
      state.categoryProductsCount = action.payload;
    },
    setAllOutlets(state, action) {
      actionCreator("outlets", state, action.payload);
    },

    onSelectCategory(state, action) {
      actionCreator("categorySelected", state, action.payload);
    },
    onSetProductCategories(state, action) {
      state.productCategories = action.payload;
    },
    customersAdded(state, action) {
      state.customers = action.payload;
    },
    productsAdded(state, action) {
      state.products = action.payload;
    },
    currentSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    openProductModal(state) {
      state.productModalOpen = !state.productModalOpen;
    },
    openVariantsModal(state) {
      state.productWithVariantsOpen = !state.productWithVariantsOpen;
    },
    openInventoryModal(state) {
      state.inventoryModalOpen = !state.inventoryModalOpen;
    },
    setProductToView(state, action) {
      state.productToView = action.payload;
    },
  },
});

export const {
  customersAdded,
  openProductModal,
  openVariantsModal,
  productsAdded,
  setProductToView,
  currentSearchTerm,
  onSetProductCategories,
  onSelectCategory,
  openInventoryModal,

  setAllOutlets,
  setCategoryProductsCount,
  setProductsOnHold,
  onAppResetProducts,
} = productsSlice.actions;
export default productsSlice.reducer;

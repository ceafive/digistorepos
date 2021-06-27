import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  outlets: [],
  outletSelected: null,
  products: [],
  searchTerm: "",
  inventoryModalOpen: false,
  productModalOpen: false,
  productToView: null,
  customers: [],
  productCategories: [],
  categorySelected: {
    category_id: "ALL",
    category_name: "ALL",
    category_description: "All Categories",
  },
};

const actionCreator = (key, state, payload) => {
  return (state[key] = payload);
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setAllOutlets(state, action) {
      actionCreator("outlets", state, action.payload);
    },
    setOutletSelected(state, action) {
      state.outletSelected = action.payload;
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
  productsAdded,
  setProductToView,
  currentSearchTerm,
  onSetProductCategories,
  onSelectCategory,
  openInventoryModal,
  setOutletSelected,
  setAllOutlets,
} = productsSlice.actions;
export default productsSlice.reducer;

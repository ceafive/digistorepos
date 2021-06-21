import { createSlice } from "@reduxjs/toolkit";
import { format } from "date-fns";
import { filter, findIndex } from "lodash";

const initialState = {
  cartTotal: 0,
  productsInCart: [],
  totalItemsInCart: 0,
  totalPriceInCart: 0,
  clickToCheckout: false,
  paymentMethodsAndAmount: [],
  paymentMethodSelected: false,
  totalPartPaymentAmount: 0,
  partPaymentAmount: "",
  cartNote: "",
  cartDiscount: "",
  cartDiscountOnCartTotal: 0,
  cartDiscountType: "percent",
  cartTotalMinusDiscount: 0,
  cartTotalMinusDiscountPlusTax: 0,
  totalTaxes: 4 / 100,
  amountReceivedFromPayer: 0,
  splitPayment: false,
  currentCustomer: null,
};

const initialProductProps = {
  quantity: 0,
  price: 0,
  discount: "",
};

const calculateDiscount = (valueToApplyOn, discountType, discountValue) => {
  let valueAfterDiscount = valueToApplyOn;
  let discount = 0;

  if (!discountValue) {
    valueAfterDiscount = valueToApplyOn;
    discount = 0;
  } else {
    if (discountType === "percent") {
      valueAfterDiscount = valueToApplyOn - (valueToApplyOn * discountValue) / 100;
      discount = (valueToApplyOn * discountValue) / 100;
    }
    if (discountType === "amount") {
      valueAfterDiscount = valueToApplyOn - discountValue;
      discount = discountValue;
    }
  }

  return {
    discountAmount: discount,
    valueReturn: Number(parseFloat(valueAfterDiscount).toFixed(2)),
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    onResetCart: (state) => {
      state.cartTotal = 0;
      state.productsInCart = [];
      state.totalItemsInCart = 0;
      state.totalPriceInCart = 0;
      state.clickToCheckout = false;
      state.paymentMethodsAndAmount = [];
      state.paymentMethodSelected = false;
      state.totalPartPaymentAmount = 0;
      state.partPaymentAmount = "";
      state.cartNote = "";
      state.cartDiscount = "";
      state.cartDiscountOnCartTotal = 0;
      state.cartDiscountType = "percent";
      state.cartTotalMinusDiscount = 0;
      state.cartTotalMinusDiscountPlusTax = 0;
      state.totalTaxes = 4 / 100;
      state.amountReceivedFromPayer = 0;
      state.splitPayment = false;
      state.currentCustomer = null;
    },
    addCustomer(state, action) {
      state.currentCustomer = action.payload;
    },
    setAmountReceivedFromPayer(state, action) {
      state.amountReceivedFromPayer = action.payload.amount;

      state.paymentMethodsAndAmount.push({
        method: action.payload.method,
        amount: action.payload.amount,
        date: format(new Date(), "iii, d MMM yy h:mmaaa"),
      });
    },
    onRemovePaymentMethod(state) {
      state.amountReceivedFromPayer = 0;
      state.paymentMethodsAndAmount = [];
    },
    calculateTaxes(state, action) {
      state.totalTaxes += action.payload;
    },
    onChangeCartDiscountType(state, action) {
      state.cartDiscountType = action.payload;
      state.cartDiscount = 0;
      state.cartTotalMinusDiscount = state.totalPriceInCart;
    },
    setDiscount: (state, action) => {
      const { payload } = action;

      if (!payload) state.cartDiscount = "";
      else state.cartDiscount = action.payload;
    },
    applyDiscount(state) {
      const { discountAmount, valueReturn } = calculateDiscount(state.totalPriceInCart, state.cartDiscountType, state.cartDiscount);

      state.cartDiscountOnCartTotal = discountAmount;
      state.cartTotalMinusDiscount = valueReturn;
      state.cartTotalMinusDiscountPlusTax = Number(parseFloat(valueReturn + valueReturn * state.totalTaxes).toFixed(2));
    },

    onClickToCheckout: (state) => {
      state.clickToCheckout = !state.clickToCheckout;
    },
    onAddCartNote: (state, action) => {
      state.cartNote = action.payload;
    },
    selectPaymentMethod: (state, action) => {
      state.paymentMethodSelected = action.payload;
    },
    addPaymentMethodAndAmount: (state, action) => {
      state.paymentMethodsAndAmount.push({
        method: action.payload,
        amount: state.partPaymentAmount,
        date: format(new Date(), "iii, d MMM yy h:mmaaa"),
      });

      state.totalPartPaymentAmount += state.partPaymentAmount;
    },
    setPartPaymentAmount: (state, action) => {
      const amount = action.payload ? parseFloat(action.payload) : "";
      state.partPaymentAmount = amount;
    },
    changeItemPropsInCart: function (state, action) {
      const foundItem = state.productsInCart.find((product) => product.title === action.payload.title);

      if (foundItem) {
        const setDiscount = (newQuantity, newPrice, discount) => {
          if (!newQuantity || !newPrice) {
            return 0;
          }

          if (!discount) {
            return newQuantity * newPrice;
          }

          const newDiscount = newQuantity * newPrice * (discount / 100);
          return newQuantity * newPrice - newDiscount;
        };

        const newQuantity = action.payload.quantity ? parseFloat(action.payload.quantity) : "";

        const newPrice = action.payload.price ? parseFloat(action.payload.price) : "";

        const discount = action.payload.discount ? parseFloat(action.payload.discount) : "";

        foundItem.quantity = newQuantity;
        foundItem.price = newPrice;
        foundItem.discount = discount;

        foundItem.totalPrice = setDiscount(newQuantity, newPrice, discount);
      }

      const totalPrice = state.productsInCart.reduce((acc, val) => acc + val.totalPrice, 0);

      const totalQuantity = state.productsInCart.reduce((acc, val) => acc + val.quantity, 0);

      state.totalPriceInCart = Number(parseFloat(totalPrice).toFixed(2));
      state.totalItemsInCart = totalQuantity;
    },
    increaseTotalItemsInCart: (state, action) => {
      if (action.payload) state.totalItemsInCart += action.payload;
      else state.totalItemsInCart++;
    },
    decreaseTotalItemsInCart: (state, action) => {
      state.totalItemsInCart = state.totalItemsInCart !== 0 ? state.totalItemsInCart-- : 0;
    },
    addItemToCart: (state, action) => {
      const foundItem = state.productsInCart.find((product) => product.title === action.payload.title);

      if (foundItem) {
        const newQuantity = foundItem.quantity + 1;
        foundItem.quantity = newQuantity;
        foundItem.totalPrice = foundItem.price * newQuantity;
      } else {
        state.productsInCart.push({
          ...initialProductProps,
          ...action.payload,
          quantity: 1,
          totalPrice: action.payload.price * 1,
        });
      }

      const totalPrice = state.productsInCart.reduce((acc, val) => acc + val.totalPrice, 0);

      const totalQuantity = state.productsInCart.reduce((acc, val) => acc + val.quantity, 0);

      state.totalPriceInCart = Number(parseFloat(totalPrice).toFixed(2));
      state.totalItemsInCart = totalQuantity;
    },
    removeItemFromCart: (state, action) => {
      const filtered = filter(state.productsInCart, (o) => o.title !== action.payload);

      state.productsInCart = filtered;

      const totalPrice = state.productsInCart.reduce((acc, val) => acc + val.totalPrice, 0);

      const totalQuantity = state.productsInCart.reduce((acc, val) => acc + val.quantity, 0);

      state.totalPriceInCart = Number(parseFloat(totalPrice).toFixed(2));
      state.totalItemsInCart = totalQuantity;
    },
  },
});

export const {
  increaseTotalItemsInCart,
  decreaseTotalItemsInCart,
  addItemToCart,
  removeItemFromCart,
  changeItemPropsInCart,
  onClickToCheckout,
  addPaymentMethodAndAmount,
  selectPaymentMethod,
  setPartPaymentAmount,
  onResetCart,
  onAddCartNote,
  onChangeCartDiscountType,
  setDiscount,
  applyDiscount,
  calculateTaxes,
  setAmountReceivedFromPayer,
  onRemovePaymentMethod,
  addCustomer,
} = cartSlice.actions;
export default cartSlice.reducer;

import { createSlice, current } from "@reduxjs/toolkit";
import { format } from "date-fns";
import { filter, findIndex, intersectionBy, intersectionWith, isEqual, remove, subtract } from "lodash";
import { v4 as uuidv4 } from "uuid";

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
  cartPromoDiscount: 0,
  cartDiscountOnCartTotal: 0,
  cartDiscountType: "percent",
  cartTotalMinusDiscount: 0,
  cartTotalMinusDiscountPlusTax: 0,
  totalTaxes: 4 / 100,
  amountReceivedFromPayer: 0,
  splitPayment: false,
  currentCustomer: null,
  transactionFeeCharges: [],
  activePayments: [],
};

const initialProductProps = {
  quantity: 0,
  price: 0,
  discount: "",
  variants: { type: "normal" },
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

const calculatePromoAmount = (valueToApplyOn, discountValue) => {
  let valueAfterDiscount = valueToApplyOn;

  if (!discountValue) {
    valueAfterDiscount = valueToApplyOn;
  } else {
    valueAfterDiscount = valueToApplyOn - discountValue;
  }

  return Number(parseFloat(valueAfterDiscount).toFixed(2));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    setActivePayments(state, action) {
      state.activePayments = action.payload;
    },
    setTransactionFeeCharges(state, action) {
      state.transactionFeeCharges = action.payload;
    },
    onResetCart: (state) => {
      return initialState;
    },
    addCustomer(state, action) {
      state.currentCustomer = action.payload;
    },
    setAmountReceivedFromPayer(state, action) {
      state.amountReceivedFromPayer += action.payload.amount;

      state.paymentMethodsAndAmount.push({
        method: action.payload.method,
        amount: action.payload.amount,
        date: format(new Date(), "iii, d MMM yy h:mmaaa"),
      });
    },
    onRemovePaymentMethod(state, action) {
      var filtered = remove(state.paymentMethodsAndAmount, function (n) {
        return n.method !== action.payload.method;
      });

      state.paymentMethodsAndAmount = filtered;
      state.amountReceivedFromPayer = subtract(state.amountReceivedFromPayer, action.payload.amount);
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
      state.cartTotalMinusDiscount = valueReturn - state.cartPromoDiscount;
      state.cartTotalMinusDiscountPlusTax = Number(parseFloat(valueReturn + valueReturn * state.totalTaxes).toFixed(2));
    },
    setPromoAmount: (state, action) => {
      state.cartPromoDiscount = action.payload;
    },
    onClickToCheckout: (state, action) => {
      state.clickToCheckout = action?.payload || !state.clickToCheckout;
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
      const foundItem = state.productsInCart.find((product) => product.uniqueId === action.payload.uniqueId);

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

        const newQuantity = action.payload.quantity ? Number(parseFloat(action.payload.quantity).toFixed(2)) : "";
        const newPrice = action.payload.price ? Number(parseFloat(action.payload.price).toFixed(2)) : "";
        const discount = action.payload.discount ? Number(parseFloat(action.payload.discount).toFixed(2)) : "";

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
      const productsInCart = state.productsInCart;
      // console.log("productsInCart", JSON.parse(JSON.stringify(productsInCart)));
      const foundItems = productsInCart.filter((product) => product.title === action.payload.title);

      let foundItem = null;
      if (foundItems) {
        const response = intersectionWith(foundItems, [action.payload], (arrVal, othVal) => {
          return isEqual(arrVal.variants, othVal.variants);
        });
        foundItem = response[0];
      }

      // console.log("1");
      if (foundItem) {
        // console.log("2");
        const newFoundItem = current(foundItem);
        if (!isEqual(newFoundItem.variants, action.payload?.variants)) {
          // console.log("3");
          const newQuantity = action.payload?.quantity ?? 1;
          state.productsInCart.push({
            ...initialProductProps,
            uniqueId: uuidv4(),
            quantity: newQuantity,
            totalPrice: Number(parseFloat(action.payload.price * newQuantity).toFixed(2)),
            ...action.payload,
          });
        } else {
          // console.log("4");
          const newQuantity = action.payload?.quantity ?? foundItem.quantity + 1;
          foundItem.quantity = newQuantity;
          foundItem.totalPrice = Number(parseFloat(foundItem.price * newQuantity).toFixed(2));
        }
      } else {
        // console.log("5");
        const newQuantity = action.payload?.quantity ?? 1;
        state.productsInCart.push({
          ...initialProductProps,
          uniqueId: uuidv4(),
          quantity: newQuantity,
          totalPrice: Number(parseFloat(action.payload.price * newQuantity).toFixed(2)),
          ...action.payload,
        });
      }

      const totalPrice = state.productsInCart.reduce((acc, val) => acc + val.totalPrice, 0);
      const totalQuantity = state.productsInCart.reduce((acc, val) => acc + val.quantity, 0);

      state.totalPriceInCart = Number(parseFloat(totalPrice).toFixed(2));
      state.totalItemsInCart = totalQuantity;
    },
    removeItemFromCart: (state, action) => {
      const filtered = filter(state.productsInCart, (o) => o.uniqueId !== action.payload);
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
  setTransactionFeeCharges,
  setActivePayments,
  setPromoAmount,
  applyPromoAmount,
} = cartSlice.actions;
export default cartSlice.reducer;

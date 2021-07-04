const { reduce } = require("lodash");

const configureVariables = (transactionFeeCharges, cartTotalMinusDiscountPlusTax, deliveryCharge) => {
  const fees = Number(parseFloat(reduce(transactionFeeCharges, (sum, n) => sum + Number(parseFloat(n?.charge).toFixed(3)), 0)).toFixed(3));
  const saleTotal = Number(parseFloat(cartTotalMinusDiscountPlusTax + (deliveryCharge?.price || 0) + fees).toFixed(3));

  return {
    fees,
    saleTotal,
  };
};

export { configureVariables };

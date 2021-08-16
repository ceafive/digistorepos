import { onRemovePaymentMethod } from "features/cart/cartSlice";
import { find, reduce, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { paymentOptionNames } from "utils";

const ListItem = ({ text, value, className }) => {
  return (
    <div className={`flex justify-between ${className}`}>
      <p>{text}</p>
      <p>{value}</p>
    </div>
  );
};

const ReceiptsSection = ({ step }) => {
  const dispatch = useDispatch();

  // Selectors
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartNote = useSelector((state) => state.cart.cartNote);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const cartTotalMinusDiscount = useSelector((state) => state.cart.cartTotalMinusDiscount);
  const productsInCart = useSelector((state) => state.cart.productsInCart);
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const cartDiscountOnCartTotal = useSelector((state) => state.cart.cartDiscountOnCartTotal);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const paymentMethodsAndAmount = useSelector((state) => state.cart.paymentMethodsAndAmount);
  const transactionFeeCharges = useSelector((state) => state.cart.transactionFeeCharges);
  const totalItemsInCart = useSelector((state) => state.cart.totalItemsInCart);
  const cartPromoDiscount = useSelector((state) => state.cart.cartPromoDiscount);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);

  // Variables
  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));
  const fees = Number(parseFloat(reduce(transactionFeeCharges, (sum, n) => sum + Number(parseFloat(n?.charge).toFixed(3)), 0)).toFixed(3));
  const balance = Number(parseFloat(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer).toFixed(3));
  const saleTotal = Number(parseFloat(cartTotalMinusDiscountPlusTax + (deliveryCharge?.price || 0) + fees).toFixed(3));

  // console.log(deliveryCharge);

  return (
    <>
      <div className="flex items-center font-semibold text-xl">
        <p className="">Sale Summary</p>
      </div>

      <div className="mt-4">
        {productsInCart.map((product, index) => {
          return (
            <div key={product.uniqueId} className="w-full flex justify-between font-bold my-4">
              <div>
                <span className="mr-6">{index + 1}.</span>
                <span>{upperCase(product.title)}</span>
              </div>
              <p>GHS{product.totalPrice}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <p>Note:</p>
        <p>{cartNote}</p>
      </div>

      <hr className="mt-6 mb-5" />

      {/* Sub amount figures */}
      <div className="pl-5 xl:pl-20">
        <ListItem text="Order Amount" value={`GHS${totalPriceInCart}`} />
        <ListItem text="Discount" value={`GHS${cartDiscountOnCartTotal}`} />
        <ListItem text="Promo Amount" value={`GHS${cartPromoDiscount}`} />
        <ListItem className="pt-4" text="Total before tax" value={`GHS${cartTotalMinusDiscount}`} />
        <ListItem text="Tax COVID-19 Levy 4%" value={`GHS${covidTax}`} />
      </div>

      <hr className="my-2" />

      <div className="flex justify-between items-center">
        <p>
          <span className="font-bold text-xl tracking-wide mr-4">SUB TOTAL</span>
          <span className="text-sm">{totalItemsInCart} item(s)</span>
        </p>
        <p>GHS{cartTotalMinusDiscountPlusTax}</p>
      </div>

      <hr className="my-2" />

      <div className="pl-5 xl:pl-20">
        {paymentMethodsAndAmount.map((paymentMethod, index) => {
          const fee = find(transactionFeeCharges, { service: paymentMethod.method });
          return (
            <div key={paymentMethod.method + index} className="flex justify-between my-4">
              <div>
                <p>{paymentOptionNames[paymentMethod.method]}</p>
                {fee ? <p className="text-sm">Fee: GHS{fee?.charge}</p> : <></>}
                {paymentMethod?.payment_number && (
                  <p className="text-sm">
                    {paymentMethod?.method === "VISAG" ? "Phone/Email" : "Payment Number"}: {paymentMethod?.payment_number}
                  </p>
                )}
                <p className="text-sm">{paymentMethod.date}</p>
              </div>

              <div className="justify-self-end justify-end justify-items-end">
                <div>
                  <span>GHS{paymentMethod.amount}</span>
                  {step === 0 && (
                    <button
                      className="focus:outline-none"
                      onClick={() => {
                        // reset({
                        //   [paymentMethod.method]: "",
                        // });
                        dispatch(onRemovePaymentMethod(paymentMethod));
                      }}
                    >
                      <i className="fas fa-minus-circle ml-2 text-red-500"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {transactionFeeCharges.length > 0 ? (
          <>
            {paymentMethodsAndAmount.length > 0 && <hr className="my-2" />}
            <div className="flex justify-between items-center">
              <p className="font-bold tracking-wide mr-4">FEES</p>
              <p>
                GHS
                {fees}
              </p>
            </div>
          </>
        ) : (
          <> </>
        )}

        {deliveryCharge ? (
          <>
            {transactionFeeCharges.length > 0 && <hr className="my-2" />}
            <div className="flex justify-between items-center">
              <p className="font-bold tracking-wide mr-4">DELIVERY FEE</p>
              <p>
                GHS
                {deliveryCharge?.price}
              </p>
            </div>
          </>
        ) : (
          <> </>
        )}

        <>
          <hr className="my-2" />
          <div className="flex justify-between items-center">
            <p className="font-bold tracking-wide mr-4">SALE TOTAL</p>
            <p>
              GHS
              {saleTotal}
            </p>
          </div>
        </>

        {amountReceivedFromPayer ? (
          <>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <p className="font-bold tracking-wide mr-4">BALANCE</p>
              <p>
                GHS
                {balance}
              </p>
            </div>
          </>
        ) : (
          <> </>
        )}
      </div>
    </>
  );
};

export default ReceiptsSection;

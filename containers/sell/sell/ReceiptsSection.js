import { applyDiscount, calculateCartSubTotal, onRemovePaymentMethod } from "features/cart/cartSlice";
import { capitalize, find, reduce, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { configureVariables, paymentOptionNames } from "utils";

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
  const cartPromoCode = useSelector((state) => state.cart.cartPromoCode);
  const cartDiscount = useSelector((state) => state.cart.cartDiscount);
  const cartItemDiscount = useSelector((state) => state.cart.cartItemDiscount);
  const cartSubTotal = useSelector((state) => state.cart.cartSubTotal);
  const cartDiscountType = useSelector((state) => state.cart.cartDiscountType);
  const hasAutoDiscount = useSelector((state) => state.cart.hasAutoDiscount);

  // Variables
  const { fees, saleTotal, covidTax, change, grandTotal } = React.useMemo(
    () => configureVariables({ transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer }),
    [transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer]
  );
  // console.log({ cartSubTotal });

  React.useEffect(() => {
    dispatch(calculateCartSubTotal());
  }, [totalPriceInCart, deliveryCharge, cartDiscountOnCartTotal, cartPromoDiscount]);

  // React.useEffect(() => {
  //   dispatch(applyDiscount());
  // }, [totalPriceInCart, totalItemsInCart, cartItemDiscount, cartDiscount, cartPromoDiscount, dispatch]);

  // console.log({ cartPromoCode });

  return (
    <>
      <div className="flex items-center text-xl font-semibold">
        <p className="">Sale Summary</p>
      </div>
      <hr className="w-1/3 border-black" />

      <div className="mt-4">
        {productsInCart.map((product, index) => {
          // console.log(product);
          return (
            <div key={product.uniqueId} className="flex justify-between w-full my-4 font-bold">
              <div className="flex">
                <span className="mr-6">{index + 1}.</span>

                <div>
                  <span>
                    {upperCase(product.title)} x {product?.quantity}
                  </span>
                  <>
                    {product.variants && (
                      <div className="flex">
                        {Object.entries(product?.variants).map((variant, index) => {
                          return (
                            <p key={variant[0]} className="p-0 m-0 text-xs font-semibold">
                              <span>{capitalize(variant[1])}</span>
                              {index !== Object.entries(product?.variants).length - 1 && <span>/ </span>}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </>
                </div>
              </div>
              <p>GHS{parseFloat(product.totalPrice).toFixed(2)}</p>
            </div>
          );
        })}
      </div>

      {cartNote && (
        <div className="flex justify-between pt-2">
          <p>Note:</p>
          <p>{cartNote}</p>
        </div>
      )}

      <hr className="mt-6 mb-5" />

      {/* Sub amount figures */}
      <div className="pl-5 xl:pl-20">
        <ListItem text="Order Amount" value={`GHS${totalPriceInCart}`} />
        {deliveryCharge && <ListItem text="Delivery Fee" value={`GHS${deliveryCharge?.price}`} />}
        <ListItem
          text={`Discount ${cartDiscountOnCartTotal && cartDiscountType === "percent" ? `(Percent)` : ""} ${
            cartDiscountOnCartTotal && cartDiscountType === "amount" ? `(Flat)` : ""
          }`}
          value={`GHS${cartDiscountOnCartTotal}`}
        />
        {cartPromoCode !== null && (
          <ListItem
            text={`Promo Code ${cartPromoCode ? `(${cartPromoCode})` : hasAutoDiscount === "YES" ? `(AUTO)` : ""}`}
            value={`GHS${cartPromoDiscount}`}
          />
        )}
        <ListItem className="pt-4" text={`Subtotal    ${totalItemsInCart} item(s)`} value={`GHS${cartSubTotal}`} />
        {/* <ListItem className="" text="Fees" value={`GHS${fees}`} /> */}
        {/* <ListItem text="Tax COVID-19 Levy 4%" value={`GHS${covidTax}`} /> */}
      </div>

      <hr className="my-2" />

      {/* <div className="flex items-center justify-between">
        <p>
          <span className="mr-4 text-xl font-bold tracking-wide">SUB TOTAL</span>
          <span className="text-sm">{totalItemsInCart} item(s)</span>
        </p>
        <p>GHS{cartTotalMinusDiscountPlusTax + deliveryCharge?.price || 0}</p>
      </div>
      <hr className="my-2" /> */}

      <div className="pl-5 xl:pl-20">
        {/* {deliveryCharge ? (
          <>
            {transactionFeeCharges.length > 0 && <hr className="my-2" />}
            <div className="flex items-center justify-between">
              <p className="mr-4 font-bold tracking-wide">DELIVERY FEE</p>
              <p>
                GHS
                {deliveryCharge?.price}
              </p>
            </div>
          </>
        ) : (
          <> </>
        )} */}

        <>
          <div className="flex items-center justify-between">
            <p className="mr-4 font-bold tracking-wide">TOTAL</p>
            <p>
              GHS
              {saleTotal}
            </p>
          </div>
        </>

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

              <div className="justify-end justify-self-end justify-items-end">
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
                      <i className="ml-2 text-red-500 fas fa-minus-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <>
          {/* {paymentMethodsAndAmount.length > 0 && <hr className="my-2" />} */}
          <div className="flex items-center justify-between">
            <p className="mr-4 font-bold tracking-wide">FEES</p>
            <p>
              GHS
              {fees}
            </p>
          </div>
        </>

        <hr className="my-2" />

        <>
          {/* {paymentMethodsAndAmount.length > 0 && <hr className="my-2" />} */}
          <div className="flex items-center justify-between">
            <p className="mr-4 font-bold tracking-wide">PAYMENT DUE</p>
            <p>
              GHS
              {grandTotal}
            </p>
          </div>
        </>

        {amountReceivedFromPayer ? (
          <>
            <hr className="my-2" />
            <div className="flex items-center justify-between">
              <p className="mr-4 font-bold tracking-wide">CHANGE</p>
              <p>
                GHS
                {-change}
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

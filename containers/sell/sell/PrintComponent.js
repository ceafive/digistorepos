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

const PrintComponent = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

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

  // console.log(cart);

  // Component State

  // Variables
  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));
  const fees = Number(parseFloat(reduce(transactionFeeCharges, (sum, n) => sum + Number(parseFloat(n?.charge).toFixed(3)), 0)).toFixed(3));
  const balance = Number(parseFloat(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer).toFixed(3));
  // const saleTotal = cartTotalMinusDiscountPlusTax + (deliveryCharge?.price || 0) + fees;
  const saleTotal = Number(parseFloat(cartTotalMinusDiscountPlusTax + (deliveryCharge?.price || 0) + fees).toFixed(3));

  return (
    <div className="">
      <div className="page-break" />
      <div className="relative w-full p-6" ref={ref}>
        <div className="mb-2">
          <div className="flex items-center justify-between w-full mb-2">
            <img src={user?.user_merchant_logo} alt={`Merchant Logo`} />
            <h1 className="text-3xl font-bold">{user?.user_merchant}</h1>
          </div>

          <hr />
        </div>

        <div className="flex items-center text-xl font-semibold">
          <p className="">Sale Summary</p>
        </div>

        <div className="mt-4">
          {productsInCart.map((product, index) => {
            return (
              <div key={product.uniqueId} className="flex justify-between w-full my-4 font-bold">
                <div>
                  <span className="mr-6">{index + 1}.</span>
                  <span>{upperCase(product.title)}</span>
                </div>
                <p>GHS{product.totalPrice}</p>
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
          <ListItem text="Discount" value={`GHS${cartDiscountOnCartTotal}`} />
          <ListItem text="Promo Amount" value={`GHS${cartPromoDiscount}`} />
          <ListItem className="pt-4" text="Total before tax" value={`GHS${cartTotalMinusDiscount}`} />
        </div>

        <hr className="my-2" />

        <div className="flex items-center justify-between">
          <p>
            <span className="mr-4 text-xl font-bold tracking-wide">SUB TOTAL</span>
            <span className="text-sm">{totalItemsInCart} item(s)</span>
          </p>
          <p>GHS{cartTotalMinusDiscountPlusTax}</p>
        </div>

        <hr className="my-2" />

        <div className="pl-5 xl:pl-20">
          {paymentMethodsAndAmount.map((paymentMethod, index) => {
            const fee = find(transactionFeeCharges, { service: paymentMethod.method });
            return (
              <div key={paymentMethod.method + index}>
                <p>{paymentOptionNames[paymentMethod.method]}</p>
                {fee ? <p className="text-sm">Fee: GHS{fee?.charge}</p> : <></>}
                {paymentMethod?.payment_number && (
                  <p className="text-sm">
                    {paymentMethod?.method === "VISAG" ? "Phone/Email" : "Payment Number"}: {paymentMethod?.payment_number}
                  </p>
                )}
                <p className="text-sm">{paymentMethod.date}</p>
              </div>
            );
          })}

          {transactionFeeCharges.length > 0 ? (
            <>
              {paymentMethodsAndAmount.length > 0 && <hr className="my-2" />}
              <div className="flex items-center justify-between">
                <p className="mr-4 font-bold tracking-wide">FEES</p>
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
          )}

          <>
            <hr className="my-2" />
            <div className="flex items-center justify-between">
              <p className="mr-4 font-bold tracking-wide">SALE TOTAL</p>
              <p>
                GHS
                {saleTotal}
              </p>
            </div>
          </>

          <>
            <hr className="my-2" />
            <div className="flex items-center justify-between">
              <p className="mr-4 font-bold tracking-wide">AMOUNT PAID</p>
              <p>
                GHS
                {amountReceivedFromPayer}
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
                  {-balance}
                </p>
              </div>
            </>
          ) : (
            <> </>
          )}

          <div className="fixed bottom-0 left-0 w-full">
            <div className="flex items-center justify-between w-full text-xs">
              <h1 className="font-bold">Thank You For Your Business</h1>
              <h1 className="font-bold">Contact Us: {user?.user_merchant_phone}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintComponent;

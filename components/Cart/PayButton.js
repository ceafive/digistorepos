import axios from "axios";
import {
  applyDiscount,
  onChangeCartDiscountType,
  onClickToCheckout,
  onResetCart,
  setCartPromoCode,
  setDiscount,
  setPromoAmount,
} from "features/cart/cartSlice";
import { upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import DiscountBox from "./DiscountBox";
import NoteBox from "./NoteBox";
import PromoCodeBox from "./PromoCodeBox";

const PayButton = () => {
  const dispatch = useDispatch();
  const totalItemsInCart = useSelector((state) => state.cart.totalItemsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartDiscount = useSelector((state) => state.cart.cartDiscount);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const cartTotalMinusDiscount = useSelector((state) => state.cart.cartTotalMinusDiscount);
  const cartDiscountOnCartTotal = useSelector((state) => state.cart.cartDiscountOnCartTotal);
  const cartPromoDiscount = useSelector((state) => state.cart.cartPromoDiscount);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const outletSelected = useSelector((state) => state.products.outletSelected);
  const productsInCart = useSelector((state) => state.cart.productsInCart);

  // Componet State
  const [showAddNoteInput, setShowAddNoteInput] = React.useState(false);
  const [showDiscountBox, setShowDiscountBox] = React.useState(false);
  const [showPromoCodeBox, setShowPromoCodeBox] = React.useState(false);
  const [checking, setProcessing] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState("");

  // Variables
  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));

  React.useEffect(() => {
    dispatch(applyDiscount());
    return () => {};
  }, [totalPriceInCart, totalItemsInCart, cartDiscount, cartPromoDiscount, dispatch]);

  const checkingPromoCode = async () => {
    try {
      setProcessing(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      let orderItems = {};

      productsInCart.forEach((product, index) => {
        orderItems[index] = {
          order_item_no: product?.uniqueId,
          order_item_qty: product?.quantity,
          order_item: product?.title,
          order_item_amt: product?.price,
        };
      });

      const userData = {
        code: upperCase(promoCode),
        amount: totalPriceInCart,
        merchant: user["user_merchant_id"],
        order_items: JSON.stringify(orderItems),
        customer: currentCustomer,
        outlet: outletSelected,
      };

      // console.log(userData);
      // return;

      const response = await axios.post("/api/sell/add-discount", userData);
      const { status, message, discount } = await response.data;

      // console.log({ status, message, discount });
      dispatch(setCartPromoCode(upperCase(promoCode)));
      dispatch(setPromoAmount(discount));
    } catch (error) {
      console.log(error);
      setProcessing(false);
    } finally {
      setPromoCode("");
      setProcessing(false);
      setShowPromoCodeBox(false);
    }
  };

  return (
    <div className="w-full">
      <hr />
      <div className="relative py-2 px-4">
        {showDiscountBox && (
          <div className="absolute bottom-0 left-0">
            <DiscountBox setShowDiscountBox={setShowDiscountBox} />
          </div>
        )}
        {showAddNoteInput && (
          <div className="absolute bottom-0 left-0 w-full">
            <NoteBox setShowAddNoteInput={setShowAddNoteInput} />
          </div>
        )}
        {showPromoCodeBox && (
          <div className="absolute bottom-0 left-0 w-2/3">
            <PromoCodeBox
              checking={checking}
              setShowPromoCodeBox={setShowPromoCodeBox}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              checkingPromoCode={checkingPromoCode}
            />
          </div>
        )}

        <div className="flex justify-end w-full mb-2">
          <button
            className="font-bold text-red-500 focus:outline-none"
            onClick={() => {
              dispatch(onResetCart());
            }}
          >
            Clear Cart
          </button>
        </div>
        <div className="flex justify-between w-full">
          <p className="font-bold">ADD</p>
          <div className="flex justify-end w-4/5 font-bold text-blue-500">
            {!cartDiscountOnCartTotal && (
              <button
                className="font-bold text-blue-500 mr-4 focus:outline-none"
                onClick={() => {
                  setShowDiscountBox(true);
                }}
              >
                Discount
              </button>
            )}
            {!cartPromoDiscount && (
              <button
                className="font-bold text-blue-500 mr-4 focus:outline-none"
                onClick={() => {
                  setShowPromoCodeBox(true);
                }}
              >
                Promo Code
              </button>
            )}
            <button
              className="font-bold text-blue-500 focus:outline-none"
              onClick={() => {
                setShowAddNoteInput(true);
              }}
            >
              Note
            </button>
          </div>
        </div>
      </div>

      <hr />
      {/* <div className="flex justify-between font-medium py-1 px-4">
        <div className="flex justify-between w-2/3">
          <p className="font-medium ">Subtotal</p>
        </div>
        <div className="flex">
          <p>GHS{totalPriceInCart}</p>
        </div>
      </div> */}

      {/* <div className="flex justify-between font-medium py-1 pt-4 px-4">
        <div className="flex justify-between w-2/3">
          <p className="font-medium text-blue-900">Total before tax</p>
        </div>
        <div className="flex ">
          <p>GHC{cartTotalMinusDiscount}</p>
        </div>
      </div> */}

      {cartDiscountOnCartTotal ? (
        <div className="flex justify-between font-medium py-2 px-4">
          <p className="font-medium ">Discount</p>

          <div className="flex items-center">
            <p className="mr-2">-GHC{cartDiscountOnCartTotal}</p>
            <button
              className="justify-self-end focus:outline-none"
              onClick={() => {
                dispatch(onChangeCartDiscountType("percent"));
                dispatch(setDiscount(""));
              }}
            >
              <i className="fas fa-trash-alt text-red-500 text-sm"></i>
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      {cartPromoDiscount ? (
        <div className="flex justify-between font-medium py-2 px-4">
          <p className="font-medium ">Promo</p>

          <div className="flex items-center">
            <p className="mr-2">-GHC{cartPromoDiscount}</p>
            <button
              className="justify-self-end focus:outline-none"
              onClick={() => {
                dispatch(setPromoAmount(0));
              }}
            >
              <i className="fas fa-trash-alt text-red-500 text-sm"></i>
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="flex justify-between font-medium py-2 px-4">
        <div className="flex justify-between w-2/3">
          <p className="font-medium ">Tax</p>
          <p>COVID-19 Levy 4%</p>
        </div>
        <p>GHC{covidTax}</p>
      </div>

      {/* Button */}
      <div className="w-full py-2 px-4">
        <button
          disabled={!totalPriceInCart}
          className={`w-full ${
            totalPriceInCart ? "bg-green-700 text-white" : "bg-gray-400 text-gray-300"
          } py-3 px-6  font-medium text-xl rounded`}
          onClick={() => {
            dispatch(onClickToCheckout());
          }}
        >
          <div className="flex justify-between">
            <p>
              <span>Pay</span>
              <span className="text-sm ml-2">{totalItemsInCart} item(s)</span>
            </p>
            <p className="text-xl">
              GHS
              {Number(parseFloat(cartTotalMinusDiscountPlusTax).toFixed(2))}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PayButton;

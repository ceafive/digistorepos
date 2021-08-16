import axios from "axios";
import {
  applyDiscount,
  onChangeCartDiscountType,
  onClickToCheckout,
  onResetCart,
  setCartPromoCode,
  setDeliveryTypeSelected,
  setDiscount,
  setPromoAmount,
} from "features/cart/cartSlice";
import { setOutletSelected } from "features/products/productsSlice";
import { upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import DiscountBox from "./DiscountBox";
import NoteBox from "./NoteBox";
import PromoCodeBox from "./PromoCodeBox";

const PayButton = () => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const totalItemsInCart = useSelector((state) => state.cart.totalItemsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartDiscount = useSelector((state) => state.cart.cartDiscount);
  const cartItemDiscount = useSelector((state) => state.cart.cartItemDiscount);
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
  }, [totalPriceInCart, totalItemsInCart, cartItemDiscount, cartDiscount, cartPromoDiscount, dispatch]);

  React.useEffect(() => {
    if (!totalItemsInCart) {
      dispatch(onChangeCartDiscountType("percent"));
      dispatch(setDiscount(""));
      dispatch(setPromoAmount(0));
    }
  }, [totalItemsInCart]);

  // console.log(cartDiscountOnCartTotal);
  // console.log(totalItemsInCart);

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
        customer: currentCustomer || "",
        outlet: outletSelected,
      };

      // console.log(userData);
      // return;

      const response = await axios.post("/api/sell/sell/add-discount", userData);
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
      <div className="relative px-4 py-2">
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
              dispatch(setOutletSelected(null));
              dispatch(setDeliveryTypeSelected(null));
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
                className={`mr-4 font-bold ${totalItemsInCart ? `text-blue-500 ` : `text-gray-200 `} focus:outline-none`}
                onClick={() => {
                  if (!totalItemsInCart) {
                    addToast(`No items in cart`, { appearance: `error`, autoDismiss: true });
                  }
                  if (totalItemsInCart) {
                    setShowDiscountBox(true);
                  }
                }}
              >
                Discount
              </button>
            )}
            {!cartPromoDiscount && (
              <button
                className={`mr-4 font-bold ${totalItemsInCart ? `text-blue-500 ` : `text-gray-200 `} focus:outline-none`}
                onClick={() => {
                  if (!totalItemsInCart) {
                    addToast(`No items in cart`, { appearance: `error`, autoDismiss: true });
                  }
                  if (totalItemsInCart) {
                    setShowPromoCodeBox(true);
                  }
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
      <div className="flex justify-between px-4 font-medium">
        <div className="flex justify-between w-2/3">
          <p className="font-medium ">Subtotal</p>
        </div>
        <div className="flex">
          <p>GHS{totalPriceInCart}</p>
        </div>
      </div>

      {/* <div className="flex justify-between px-4 py-1 pt-4 font-medium">
        <div className="flex justify-between w-2/3">
          <p className="font-medium text-blue-900">Total before tax</p>
        </div>
        <div className="flex ">
          <p>GHS{cartTotalMinusDiscount}</p>
        </div>
      </div> */}

      {cartDiscountOnCartTotal ? (
        <div className="flex justify-between px-4 font-medium">
          <p className="font-medium ">Discount</p>

          <div className="flex items-center">
            <p className="mr-2">-GHS{cartDiscountOnCartTotal}</p>
            <button
              className="justify-self-end focus:outline-none"
              onClick={() => {
                dispatch(onChangeCartDiscountType("percent"));
                dispatch(setDiscount(""));
              }}
            >
              <i className="text-sm text-red-500 fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      {cartPromoDiscount ? (
        <div className="flex justify-between px-4 font-medium">
          <p className="font-medium ">Promo</p>

          <div className="flex items-center">
            <p className="mr-2">-GHS{cartPromoDiscount}</p>
            <button
              className="justify-self-end focus:outline-none"
              onClick={() => {
                dispatch(setPromoAmount(0));
              }}
            >
              <i className="text-sm text-red-500 fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="flex justify-between px-4 font-medium">
        <div className="flex justify-between w-2/3">
          <p className="font-medium ">Tax</p>
          <p>COVID-19 Levy 4%</p>
        </div>
        <p>GHS{covidTax}</p>
      </div>

      {/* Button */}
      <div className="w-full px-4 py-2">
        <button
          disabled={!totalPriceInCart}
          className={`w-full ${totalPriceInCart ? "bg-green-700 text-white" : "bg-gray-400 text-gray-300"} py-3 px-6  font-medium text-xl rounded`}
          onClick={() => {
            dispatch(onClickToCheckout());
          }}
        >
          <div className="flex justify-between">
            <p>
              <span>Pay</span>
              <span className="ml-2 text-sm">{totalItemsInCart} item(s)</span>
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

import {
  onClickToCheckout,
  onAddCartNote,
  onChangeCartDiscountType,
  setDiscount,
  applyDiscount,
  onResetCart,
} from "features/cart/cartSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import DiscountBox from "./DiscountBox";
import NoteBox from "./NoteBox";

const PayButton = () => {
  const dispatch = useDispatch();
  const totalItemsInCart = useSelector((state) => state.cart.totalItemsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartNote = useSelector((state) => state.cart.cartNote);
  const cartDiscountType = useSelector((state) => state.cart.cartDiscountType);
  const cartDiscount = useSelector((state) => state.cart.cartDiscount);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const cartTotalMinusDiscount = useSelector((state) => state.cart.cartTotalMinusDiscount);
  const cartDiscountOnCartTotal = useSelector((state) => state.cart.cartDiscountOnCartTotal);

  const [showAddNoteInput, setShowAddNoteInput] = React.useState(false);
  const [showDiscountBox, setShowDiscountBox] = React.useState(false);

  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));

  React.useEffect(() => {
    dispatch(applyDiscount());
    return () => {};
  }, [totalPriceInCart, totalItemsInCart, cartDiscount, dispatch]);

  return (
    <div className="">
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
          <div className="flex justify-end w-2/3 font-bold text-blue-500">
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
            {/* <button className="font-bold text-blue-500 mr-4 focus:outline-none">Promo Code</button> */}
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
            <p className="mr-2">GHC{cartDiscountOnCartTotal}</p>
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
            totalPriceInCart ? "bg-green-600 text-white" : "bg-gray-400 text-gray-300"
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

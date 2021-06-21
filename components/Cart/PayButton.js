import {
  onClickToCheckout,
  onAddCartNote,
  onChangeCartDiscountType,
  setDiscount,
  applyDiscount,
} from "features/cart/cartSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const PayButton = () => {
  const dispatch = useDispatch();
  const totalItemsInCart = useSelector((state) => state.cart.totalItemsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartNote = useSelector((state) => state.cart.cartNote);
  const cartDiscountType = useSelector((state) => state.cart.cartDiscountType);
  const cartDiscount = useSelector((state) => state.cart.cartDiscount);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const cartTotalMinusDiscountPlusTax = useSelector(
    (state) => state.cart.cartTotalMinusDiscountPlusTax
  );
  const cartTotalMinusDiscount = useSelector(
    (state) => state.cart.cartTotalMinusDiscount
  );

  const [showAddNoteInput, setShowAddNoteInput] = React.useState(false);

  const covidTax = Number(
    parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2)
  );

  React.useEffect(() => {
    dispatch(applyDiscount());
    return () => {};
  }, [totalPriceInCart, totalItemsInCart, cartDiscount, dispatch]);

  return (
    <div className="px-4">
      <hr />
      <div className="flex justify-between py-2">
        {!showAddNoteInput && (
          <button
            className="font-semibold text-blue-500"
            onClick={() => {
              setShowAddNoteInput(true);
            }}
          >
            Add a note to this sale
          </button>
        )}
        {showAddNoteInput && (
          <input
            value={cartNote}
            onChange={(e) => {
              e.persist();
              dispatch(onAddCartNote(e.target.value));
            }}
            type="text"
            placeholder="Add a note here"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
          />
        )}
        {/* <p className="font-semibold text-blue-500"></p> */}
        {/* <div className="flex justify-between w-2/3">
          <p className="font-semibold text-blue-500">Discount</p>
          <p className="font-semibold text-gray-500">Promo Code</p>
          <p className="font-semibold text-blue-500">Note</p>
        </div> */}
      </div>

      <hr />
      <div className="flex justify-between font-bold py-1">
        <div className="flex justify-between w-2/3">
          <p className="font-bold text-blue-500">Subtotal</p>
        </div>
        <div className="flex">
          <p>GHS{totalPriceInCart}</p>
        </div>
      </div>

      <div className="flex justify-between items-center font-bold py-1">
        <div className="w-2/3">
          <p className="font-bold text-blue-500">Discount</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2 border border-gray-200 rounded-full">
            <div
              className={`${
                cartDiscountType === "percent" ? "bg-gray-200" : ""
              } m-1 rounded-full px-2 transition-all duration-500 ease-in-out`}
            >
              <button
                className="focus:outline-none"
                onClick={() => {
                  dispatch(onChangeCartDiscountType("percent"));
                }}
              >
                %
              </button>
            </div>
            <div
              className={`${
                cartDiscountType === "amount" ? "bg-gray-200" : ""
              } m-1 rounded-full px-2 transition-all duration-500 ease-in-out`}
            >
              <button
                className="focus:outline-none"
                onClick={() => {
                  dispatch(onChangeCartDiscountType("amount"));
                }}
              >
                ₵
              </button>
            </div>
          </div>
          <input
            value={cartDiscount}
            max={100}
            maxLength={3}
            onChange={(e) => {
              e.persist();
              dispatch(setDiscount(e.target.value));
            }}
            type="number"
            className="appearance-none border border-gray-200 text-right placeholder-blueGray-300 text-blueGray-600 rounded text-sm outline-none focus:outline-none focus:ring-2 w-full"
          />
        </div>
      </div>

      <div className="flex justify-between font-bold py-1 pt-4">
        <div className="flex justify-between w-2/3">
          <p className="font-bold text-blue-900">Total before tax</p>
        </div>
        <div className="flex ">
          <p>GHC{cartTotalMinusDiscount}</p>
        </div>
      </div>

      <div className="flex justify-between font-bold py-1">
        <div className="flex justify-between w-2/3">
          <p className="font-bold text-blue-500">Tax</p>
          <p>VAT COVID-19 Levy 4%</p>
        </div>
        <div className="flex ">
          <p>GHC{covidTax}</p>
        </div>
      </div>

      {/* Button */}
      <div className="w-full py-2">
        <button
          disabled={!totalPriceInCart}
          className={`w-full ${
            totalPriceInCart
              ? "bg-green-600 text-white"
              : "bg-gray-400 text-gray-300"
          } py-3 px-6  font-semibold text-xl rounded`}
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

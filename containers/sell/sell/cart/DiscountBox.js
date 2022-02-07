import { onChangeCartDiscountType, setDiscount } from "features/cart/cartSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const DiscountBox = ({ setShowDiscountBox }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const cartDiscountType = useSelector((state) => state.cart.cartDiscountType);
  const cartSubTotal = useSelector((state) => state.cart.cartSubTotal);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);

  const [amount, setAmount] = React.useState(0);

  // console.log({ cartSubTotal });

  return (
    <div className="font-medium bg-white z-10 w-full h-38 rounded shadow border border-gray-500 overflow-hidden">
      <div className="h-full">
        <p className="font-bold mt-2 px-2">Discount</p>
        <hr />
        <div className="flex items-center mt-4 px-2">
          <div className="flex items-center mr-2 border border-gray-200 rounded-full">
            <div className={`${cartDiscountType === "percent" ? "bg-gray-200" : ""} m-1 rounded-full px-3 transition-colors`}>
              <button
                className="focus:outline-none h-full w-full"
                onClick={() => {
                  dispatch(onChangeCartDiscountType("percent"));
                }}
              >
                %
              </button>
            </div>
            <div className={`${cartDiscountType === "amount" ? "bg-gray-200" : ""} m-1 rounded-full px-3 transition-colors`}>
              <button
                className="focus:outline-none h-full w-full"
                onClick={() => {
                  dispatch(onChangeCartDiscountType("amount"));
                }}
              >
                ₵
              </button>
            </div>
          </div>
          <input
            value={amount}
            max={100}
            maxLength={3}
            onChange={(e) => {
              e.persist();
              const parsedFloat = parseFloat(e.target.value);

              // check discount is not more than cart amount
              if (cartDiscountType === "percent") {
                if (parsedFloat > 99.99) {
                  setAmount(0);
                  return addToast(`Value cannot be more than total cart price`, { appearance: "error", autoDismiss: true });
                }
                setAmount(e.target.value);
              }

              if (cartDiscountType === "amount") {
                const discountedValue = cartSubTotal - parsedFloat;
                if (discountedValue < 0) {
                  setAmount(0);
                  return addToast(`Value cannot be more than total cart price`, { appearance: "error", autoDismiss: true });
                }
                setAmount(e.target.value);
              }
            }}
            type="number"
            className="appearance-none border border-gray-200 placeholder-blueGray-300 text-blueGray-600 rounded text-sm outline-none focus:outline-none w-full"
          />
        </div>

        <div className="flex justify-end w-full bg-gray-300 mt-2 p-2 ">
          <button
            className="text-white font-bold bg-red-700 px-3 py-1 mr-2 rounded"
            onClick={() => {
              setShowDiscountBox(false);
              dispatch(onChangeCartDiscountType("percent"));
            }}
          >
            Cancel
          </button>
          <button
            className="text-white font-bold bg-green-500 px-3 py-1 rounded"
            onClick={() => {
              dispatch(setDiscount(amount));
              setShowDiscountBox(false);
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountBox;

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { onClickToCheckout, onResetCart } from "features/cart/cartSlice";
import { useToasts } from "react-toast-notifications";

const PaymentReceived = ({ printing, handlePrint, handleSendNotification, sendingNotification }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  // Selectors
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);

  return (
    <div className="mt-10 py-20 text-center">
      <p className="font-bold text-4xl">Payment Received</p>
      <div>
        {Number(
          parseFloat(
            amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0 ? 0 : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
          ).toFixed(2)
        ) > 0 && (
          <p>
            <span className="font-bold">Change to give to customer: </span>
            <span>
              GHS
              {Number(
                parseFloat(
                  amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0 ? 0 : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
                ).toFixed(2)
              )}
            </span>
          </p>
        )}
      </div>

      <div className="flex justify-center mt-24 text-sm font-semibold">
        <div className="flex justify-center w-full">
          <button disabled={printing} className="focus:outline-none text-gray-800  xl:text-lg 2xl:text-3xl  mr-6" onClick={handlePrint}>
            <span className="w-6 mr-1">
              <i className="fas fa-print"></i>
            </span>
            <span>{"Print"}</span>
          </button>

          {currentCustomer?.customer_phone && (
            <button
              disabled={sendingNotification}
              className="focus:outline-none text-gray-800   xl:text-lg 2xl:text-3xl  mr-6"
              onClick={() => {
                handleSendNotification("SMS");
              }}
            >
              <span className="w-6 mr-1">
                <i className="fas fa-sms"></i>
              </span>
              <span>{"SMS Receipt"}</span>
            </button>
          )}

          {currentCustomer?.customer_email && (
            <button
              disabled={sendingNotification}
              className="focus:outline-none text-gray-800   xl:text-lg 2xl:text-3xl"
              onClick={() => {
                handleSendNotification("EMAIL");
              }}
            >
              <span className="w-6 mr-1">
                <i className="fas fa-envelope"></i>
              </span>
              <span>{"Email Receipt"}</span>
            </button>
          )}
        </div>
      </div>
      {/* <div className="mt-12 text-sm font-semibold">
            <div className="w-full">
              <span className="z-10 absolute text-center text-blueGray-800 w-8 pl-3 py-3">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="text"
                placeholder="Add a customer to email them a receipt"
                className="border-0 px-3 py-3 placeholder-blueGray-500 text-blueGray-800 relative bg-white  rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          </div> */}

      <div className="w-full self-end mt-20">
        <button
          className="bg-green-700 px-6 py-4 text-white font-semibold rounded focus:outline-none w-full text-center"
          onClick={() => {
            dispatch(onClickToCheckout(false));
            dispatch(onResetCart());
          }}
        >
          Close Sale
        </button>
      </div>
    </div>
  );
};

export default PaymentReceived;

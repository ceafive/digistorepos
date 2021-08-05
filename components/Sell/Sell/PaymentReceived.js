import { onClickToCheckout, onResetCart } from "features/cart/cartSlice";
import { setOutletSelected, setProductsOnHold } from "features/products/productsSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const PaymentReceived = ({ printing, handlePrint, handleSendNotification, sendingNotification }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  // Selectors
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);

  const [compToRender, setCompToRender] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  return (
    <div className="mt-10 py-20 text-center">
      <p className="font-bold text-4xl ">Payment Received</p>
      <div>
        {Number(
          parseFloat(
            amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0 ? 0 : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
          ).toFixed(2)
        ) > 0 && (
          <p className="mt-2 text-4xl 2xl:text-5xl text-blueGray-900">
            <span className="font-bold">Give </span>
            <span className="font-bold">
              GHS
              {Number(
                parseFloat(
                  amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0 ? 0 : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
                ).toFixed(2)
              )}
            </span>
            <span className="font-bold"> Change</span>
          </p>
        )}
      </div>

      <div className="flex justify-center mt-12 text-sm font-semibold">
        <div className="flex justify-center w-full">
          <button
            disabled={printing}
            className="focus:outline-none text-gray-800 xl:text-lg 2xl:text-xl mr-6"
            onClick={() => {
              addToast(`Opening print dialog`, { appearance: "info", autoDismiss: true });
              handlePrint();
            }}
          >
            <span className="w-6 mr-1">
              <i className="fas fa-print" />
            </span>
            <span>{"Print"}</span>
          </button>

          {/* {currentCustomer?.customer_phone && ( */}
          <button
            disabled={sendingNotification}
            className="focus:outline-none text-gray-800 xl:text-lg 2xl:text-xxl mr-6"
            onClick={() => {
              if (currentCustomer?.customer_phone) {
                handleSendNotification("SMS");
              } else {
                addToast(`Enter phone number to send receipt to`, { autoDismiss: true });
                setCompToRender("phone");
              }
            }}
          >
            <span className="w-6 mr-1">
              <i className="fas fa-sms" />
            </span>
            <span>{"SMS Receipt"}</span>
          </button>
          {/* )} */}

          {/* {currentCustomer?.customer_email && ( */}
          <button
            disabled={sendingNotification}
            className="focus:outline-none text-gray-800 xl:text-lg 2xl:text-xxl"
            onClick={() => {
              if (currentCustomer?.customer_phone) {
                handleSendNotification("EMAIL");
              } else {
                addToast(`Enter email address to send receipt to`, { autoDismiss: true });
                setCompToRender("email");
              }
            }}
          >
            <span className="w-6 mr-1">
              <i className="fas fa-envelope" />
            </span>
            <span>{"Email Receipt"}</span>
          </button>
          {/* )} */}
        </div>
      </div>

      {compToRender === "phone" && (
        <div className="mt-6 font-semibold">
          <div className="w-full">
            <div className="relative">
              <span className="z-10 absolute text-center text-blueGray-800 w-8 pl-3 py-5">
                <i className="fas fa-phone"></i>
              </span>
              <input
                type="number"
                value={phoneNumber}
                onChange={(e) => {
                  e.persist();
                  setPhoneNumber(e.target.value);
                }}
                placeholder="Enter phone number to send receipt to"
                className="border-0 px-3 py-5 placeholder-blueGray-500 text-blueGray-800 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring-1 w-full pl-10"
              />
              <button
                className="absolute right-5 bg-green-300 px-2 py-1 font-bold"
                style={{
                  top: "25%",
                }}
                onClick={() => {
                  addToast(`NOT IMPLEMENTED`, { autoDismiss: true });
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {compToRender === "email" && (
        <div className="mt-6 font-semibold">
          <div className="w-full">
            <div className="relative">
              <span className="z-10 absolute text-center text-blueGray-800 w-8 pl-3 py-5">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  e.persist();
                  setEmail(e.target.value);
                }}
                placeholder="Enter email address to send receipt to"
                className="border-0 px-3 py-5 placeholder-blueGray-500 text-blueGray-800 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring-1 w-full pl-10"
              />
              <button
                className="absolute right-5 bg-green-300 px-2 py-1 font-bold"
                style={{
                  top: "25%",
                }}
                onClick={() => {
                  addToast(`NOT IMPLEMENTED`, { autoDismiss: true });
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full self-end mt-20">
        <button
          className="bg-green-700 px-6 py-4 text-white font-semibold rounded focus:outline-none w-full text-center"
          onClick={() => {
            dispatch(onClickToCheckout(false));
            dispatch(onResetCart());
            dispatch(setProductsOnHold());
            dispatch(setOutletSelected(null));
          }}
        >
          Close Sale
        </button>
      </div>
    </div>
  );
};

export default PaymentReceived;

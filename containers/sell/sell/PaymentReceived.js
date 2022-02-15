import { onClickToCheckout, onResetCart, setOutletSelected } from "features/cart/cartSlice";
import { setProductsOnHold } from "features/products/productsSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { configureVariables } from "utils";

const PaymentReceived = ({ printing, handlePrint, handleSendNotification, sendingNotification, setReFetch }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  // Selectors
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const transactionFeeCharges = useSelector((state) => state.cart.transactionFeeCharges);
  const cartSubTotal = useSelector((state) => state.cart.cartSubTotal);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const rewardPoints = useSelector((state) => state.cart.rewardPoints);
  const invoiceDetails = useSelector((state) => state.cart.invoiceDetails);

  // console.log(invoiceDetails);

  const [compToRender, setCompToRender] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  const { change } = React.useMemo(
    () => configureVariables({ transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer }),
    [transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer]
  );

  return (
    <div className="py-20 mt-10 text-center">
      <p className="text-4xl font-bold ">{invoiceDetails?.payment === "INVOICE" ? "Invoice Generated" : "Payment Received"}</p>
      {invoiceDetails?.payment === "INVOICE" && (
        <div>
          <p className="mt-2 text-2xl 2xl:text-2xl text-blueGray-900">
            <span className="font-bold">{invoiceDetails?.message}</span>
          </p>
        </div>
      )}
      {change ? (
        <div>
          <p className="mt-2 text-4xl 2xl:text-5xl text-blueGray-900">
            <span className="font-bold">Give </span>
            <span className="font-bold">
              GHS
              {-change}
            </span>
            <span className="font-bold"> Change</span>
          </p>
        </div>
      ) : (
        <></>
      )}

      {rewardPoints && (
        <div className="w-full">
          {rewardPoints?.reward_message && (
            <p className="my-2 text-blueGray-900">
              <span className="">{rewardPoints?.reward_message}</span>
            </p>
          )}
          {rewardPoints?.reward_points_earned && (
            <p className="my-2 text-blueGray-900">
              <span className="font-bold">Reward Points Earned </span>
              <span className="">{rewardPoints?.reward_points_earned} pts</span>
            </p>
          )}
          {rewardPoints?.reward_total_points && (
            <p className="my-2 text-blueGray-900">
              <span className="font-bold">Total Reward Points </span>
              <span className="">{rewardPoints?.reward_total_points} pts</span>
            </p>
          )}
        </div>
      )}

      <div className="flex justify-center mt-12 text-sm font-semibold">
        <div className="flex justify-center w-full">
          <button
            disabled={printing}
            className="mr-6 text-gray-800 focus:outline-none xl:text-lg 2xl:text-xl"
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

          {invoiceDetails?.payment == "INVOICE" && (
            <>
              <a
                href={`https://api.whatsapp.com/send?phone=233${currentCustomer?.customer_phone}&text=${`${invoiceDetails?.invoice_url}
                        `}`}
                target="_blank"
                rel="noreferrer"
                className={`text-blue-500`}
              >
                <button
                  className="mr-6 text-gray-800 focus:outline-none xl:text-lg 2xl:text-xxl"
                  onClick={() => {
                    if (currentCustomer?.customer_phone) {
                      // handleSendNotification("SMS");
                    } else {
                      addToast(`Enter phone number to send receipt to`, { autoDismiss: true });
                      setCompToRender("phone");
                    }
                  }}
                >
                  <span className="w-6 mr-1">
                    <i className="fas fa-sms" />
                  </span>
                  <span>Send payment link to Whatsapp</span>
                </button>
              </a>
            </>
          )}

          {invoiceDetails?.payment !== "INVOICE" && (
            <>
              <button
                disabled={sendingNotification}
                className="mr-6 text-gray-800 focus:outline-none xl:text-lg 2xl:text-xxl"
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

              <button
                disabled={sendingNotification}
                className="text-gray-800 focus:outline-none xl:text-lg 2xl:text-xxl"
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
            </>
          )}
        </div>
      </div>

      {compToRender === "phone" && (
        <div className="mt-6 font-semibold">
          <div className="w-full">
            <div className="relative">
              <span className="absolute z-10 w-8 py-5 pl-3 text-center text-blueGray-800">
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
                className="relative w-full px-3 py-5 pl-10 text-sm bg-white border-0 rounded shadow outline-none placeholder-blueGray-500 text-blueGray-800 focus:outline-none focus:ring-1"
              />
              <button
                className="absolute px-2 py-1 font-bold bg-green-300 right-5"
                style={{
                  top: "25%",
                }}
                onClick={async () => {
                  const status = await handleSendNotification("SMS", { email, phoneNumber });
                  status ? setPhoneNumber("") : null;
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
              <span className="absolute z-10 w-8 py-5 pl-3 text-center text-blueGray-800">
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
                className="relative w-full px-3 py-5 pl-10 text-sm bg-white border-0 rounded shadow outline-none placeholder-blueGray-500 text-blueGray-800 focus:outline-none focus:ring-1"
              />
              <button
                className="absolute px-2 py-1 font-bold bg-green-300 right-5"
                style={{
                  top: "25%",
                }}
                onClick={async () => {
                  const status = await handleSendNotification("EMAIL", { email, phoneNumber });
                  status ? setEmail("") : null;
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="self-end w-full mt-20">
        <button
          className="w-full px-6 py-4 font-semibold text-center text-white bg-green-700 rounded focus:outline-none"
          onClick={() => {
            dispatch(onClickToCheckout(false));
            dispatch(onResetCart());
            dispatch(setProductsOnHold());
            dispatch(setOutletSelected(null));
            setReFetch(new Date());
          }}
        >
          Close Sale
        </button>
      </div>
    </div>
  );
};

export default PaymentReceived;

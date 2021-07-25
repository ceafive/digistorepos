import AddCustomerProcessPayment from "components/Cart/AddCustomerProcessPayment";
import TypeDelivery from "components/Sell/TypeDelivery";
import Spinner from "components/Spinner";
import {
  addCustomer,
  onClickToCheckout,
  setDeliveryCharge,
  setDeliveryNotes,
  setDeliveryTypeSelected,
  setPaymentMethodSet,
} from "features/cart/cartSlice";
import { setOutletSelected } from "features/products/productsSlice";
import { intersectionWith, isEqual } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const paymentOptions = [
  { name: "CASH", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-CASH.png", showInput: false },
  { name: "VISAG", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-VISAG.png", showInput: true },
  { name: "QRPAY", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-QRPAY.png", showInput: true },
  { name: "BNKTR", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-BNKTR.png", showInput: true },
  { name: "MTNMM", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-MTNMM.png", showInput: true },
  { name: "TIGOC", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-TIGOC.png", showInput: true },
  { name: "VODAC", img: " https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-VODAC.png", showInput: true },
  { name: "GCBMM", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-GCBMM.png", showInput: true },
];

const paymentOptionNames = {
  VISAG: "VISA AND MASTERCARD",
  MTNMM: "MTN MOBILE MONEY",
  TIGOC: "AIRTELTIGO MONEY",
  VODAC: "VODAFONE CASH",
  QRPAY: "GHQR PAY",
  GCBMM: "GCB MOBILE MONEY",
  BNKTR: "BANK TRANSFER",
  CASH: "CASH",
};

const merchantUserDeliveryOptions = [
  { name: "Walk In" },
  { name: "Dine In" },
  { name: "Pickup" },
  {
    name: "Delivery",
  },
];

const loyaltyTabs = ["Loyalty", "Layby", "Store Credit", "On Account"];

const ProcessPayment = ({
  handleRaiseOrder,
  setOpenPhoneNumberInputModal,
  handlePrint,
  setStep,
  step,
  printing,
  payerAmountEntered,
  setPayerAmountEntered,
  fetching,
  setFetching,
  processError,
  handleSendNotification,
  sendingNotification,
}) => {
  const dispatch = useDispatch();

  // Selectors
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const outlets = useSelector((state) => state.products.outlets);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const activePayments = useSelector((state) => state.cart.activePayments);
  const deliveryTypeSelected = useSelector((state) => state.cart.deliveryTypeSelected);
  const outletSelected = useSelector((state) => state.products.outletSelected);
  const paymentMethodSet = useSelector((state) => state.cart.paymentMethodSet);
  const deliveryLocationInputted = useSelector((state) => state.cart.deliveryLocationInputted);
  const cart = useSelector((state) => state.cart);

  // Variables
  const balance = Number(parseFloat(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer).toFixed(3));
  const userDetails = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));

  const paymentButtons = React.useMemo(() => {
    const intersected = intersectionWith(paymentOptions, userDetails?.user_permissions, (arrVal, othVal) => {
      return isEqual(arrVal.name, othVal);
    });
    const allIntersected = intersectionWith(intersected, activePayments, (arrVal, othVal) => {
      return isEqual(arrVal.name, othVal);
    });
    return allIntersected;
  }, [activePayments, userDetails?.user_permissions]);
  const deliveryLocationIsEmpty = deliveryTypeSelected === "Delivery" && !deliveryLocationInputted;

  // console.log(fetching, deliveryTypeSelected, deliveryLocationIsEmpty, amountReceivedFromPayer, balance);
  // console.log(outletSelected);

  return (
    <div>
      {/* Back To sale */}
      <p className="text-right mt-4 mb-4 ">
        <button
          className="font-bold text-lg focus:outline-none"
          onClick={() => {
            dispatch(onClickToCheckout());
            // dispatch(setProductsOnHold());
          }}
        >
          <i className="fas fa-arrow-left mr-1 "></i>
          <span>Back to Sale</span>
        </button>{" "}
      </p>
      {/* Back To sale */}

      {/* Pay Field */}
      <div className="flex justify-between items-center">
        <p className="text-5xl">Pay</p>
        <div>
          <input
            value={payerAmountEntered}
            readOnly={true}
            // readOnly={amountReceivedFromPayer >= cartTotalMinusDiscountPlusTax}
            onChange={(e) => {
              e.persist();
              setPayerAmountEntered(e.target.value);
            }}
            type="number"
            placeholder="Enter an amount"
            className="border border-blue-500 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded shadow focus:outline-none text-2xl"
          />
        </div>
      </div>
      {/* Pay Field */}

      {/* Payment Buttons */}
      <div className="grid grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 my-4 mt-8">
        {paymentButtons.map((paymentButton) => {
          return (
            <div key={paymentButton.name}>
              <button
                disabled={!payerAmountEntered || payerAmountEntered === "0"}
                className={`${
                  paymentMethodSet === paymentButton.name ? "ring-4" : ""
                }  w-40 h-12 font-bold bg-blue-500 text-white focus:outline-none rounded shadow-sm overflow-hidden px-2 break-words`}
                onClick={() => {
                  dispatch(setPaymentMethodSet(paymentButton.name));
                  setOpenPhoneNumberInputModal(true);
                }}
              >
                {paymentOptionNames[paymentButton.name]}
                {/* <img src={paymentButton.img} alt={paymentButton.name} /> */}
              </button>
            </div>
          );
        })}
      </div>
      {/* Payment Buttons */}

      {/* Outlets */}
      {outlets.length > 1 && (
        <div className="mt-4">
          <h1 className="font-semibold mb-1">Outlets</h1>
          <div className="grid grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {outlets.map((outlet) => {
              return (
                <button
                  key={outlet.outlet_name}
                  className={`${
                    outletSelected?.outlet_name === outlet.outlet_name ? "ring-2" : ""
                  } w-36 h-24 border border-gray-300 focus:outline-none rounded shadow overflow-hidden font-bold px-2 break-words`}
                  onClick={() => {
                    dispatch(setOutletSelected(outlet));
                  }}
                >
                  {outlet.outlet_name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Outlets */}

      {/* Delivery Options */}
      <div className="mt-4">
        <h1 className="font-semibold mb-1">Pickup or Delivery?</h1>
        <div className="grid grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {merchantUserDeliveryOptions
            .filter((option) => {
              if (option.name === "Dine In") {
                if (userDetails?.user_merchant_cat_id === "67" || userDetails?.user_merchant_cat_id === "68") {
                  return true;
                } else return false;
              }
              return true;
            })
            .map((option) => {
              return (
                <div key={option.name} className="">
                  <button
                    className={`${
                      deliveryTypeSelected === option.name ? "ring-2" : ""
                    } w-36 h-24 border border-gray-300 focus:outline-none rounded shadow overflow-hidden font-bold px-2 break-words`}
                    onClick={() => {
                      if (option?.name !== "Delivery") {
                        dispatch(setDeliveryCharge(null));
                        dispatch(setDeliveryNotes(""));
                      }
                      dispatch(setDeliveryTypeSelected(option?.name));
                    }}
                  >
                    {option.name}
                  </button>
                </div>
              );
            })}
        </div>

        {deliveryTypeSelected === "Delivery" && (
          <div className="mt-4">
            <TypeDelivery setFetching={setFetching} />
          </div>
        )}
      </div>
      {/* Delivery Options */}

      {/* Customer */}
      {currentCustomer ? (
        <div className="w-full mt-4">
          <h1 className="font-semibold mb-1 text-sm">Current Customer</h1>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold">{currentCustomer.customer_name}</span>
              <span className="text-xs ml-2">{currentCustomer.customer_email}</span>
              <span className="text-xs ml-2">{currentCustomer.customer_phone}</span>
            </div>
            <div>
              <button
                className=" focus:outline-none font-bold"
                onClick={() => {
                  dispatch(addCustomer(null));
                }}
              >
                <i className="fas fa-trash-alt text-red-500"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full mt-4 z-10">
          <AddCustomerProcessPayment />
        </div>
      )}
      {/* Customer */}

      {/* 
          <div className="grid grid-cols-3 gap-2 my-4">
            {loyaltyTabs.map((loyaltyTab) => {
              return (
                <div key={loyaltyTab} className="">
                  <button
                    key={loyaltyTab}
                    className="bg-gray-400 px-6 py-4 text-gray-200 font-semibold rounded focus:outline-none w-full text-center"
                  >
                    {loyaltyTab}
                  </button>
                </div>
              );
            })}
          </div> */}
      <div className="w-full self-end mt-20">
        <button
          disabled={fetching || !deliveryTypeSelected || deliveryLocationIsEmpty || !amountReceivedFromPayer || balance > 0}
          className={`${
            fetching || !deliveryTypeSelected || deliveryLocationIsEmpty || !amountReceivedFromPayer || balance > 0
              ? "bg-gray-400 text-gray-300"
              : "bg-green-700 text-white"
          } px-6 py-4 font-semibold rounded focus:outline-none w-full text-center`}
          onClick={handleRaiseOrder}
        >
          {fetching && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width={20} height={20} />
            </div>
          )}
          Raise Order
        </button>
        {processError && <p className="text-center text-red-500 text-sm">{processError}</p>}
      </div>
    </div>
  );
};

export default ProcessPayment;

// import AddCustomerProcessPayment from "components/Cart/AddCustomerProcessPayment";
// import TypeDelivery from "components/Sell/Sell/TypeDelivery";
// import Spinner from "components/Spinner";
import {
  addCustomer,
  applyDiscount,
  onClickToCheckout,
  setCartPromoCode,
  setDeliveryCharge,
  setDeliveryLocationInputted,
  setDeliveryNotes,
  setDeliveryTypeSelected,
  setOutletSelected,
  setPaymentMethodSet,
  setPromoAmount,
  setPromoType,
} from "features/cart/cartSlice";
import { filter, intersectionWith, isEqual, upperCase } from "lodash";
import dynamic from "next/dynamic";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { configureVariables, merchantUserDeliveryOptions, paymentOptionNames, paymentOptions } from "utils";

const Spinner = dynamic(() => import("components/Spinner"));
const TypeDelivery = dynamic(() => import("components/Sell/Sell/TypeDelivery"));
const AddCustomerProcessPayment = dynamic(() => import("components/Cart/AddCustomerProcessPayment"));

const ProcessPayment = ({
  handleRaiseOrder,
  setOpenPhoneNumberInputModal,
  payerAmountEntered,
  setPayerAmountEntered,
  fetching,
  setFetching,
  processError,
}) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  // Selectors
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const outlets = useSelector((state) => state.products.outlets);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const activePayments = useSelector((state) => state.cart.activePayments);
  const deliveryTypeSelected = useSelector((state) => state.cart.deliveryTypeSelected);
  const outletSelected = useSelector((state) => state.cart.outletSelected);
  const paymentMethodSet = useSelector((state) => state.cart.paymentMethodSet);
  const deliveryLocationInputted = useSelector((state) => state.cart.deliveryLocationInputted);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);
  const promoType = useSelector((state) => state.cart.promoType);
  const transactionFeeCharges = useSelector((state) => state.cart.transactionFeeCharges);
  const cartSubTotal = useSelector((state) => state.cart.cartSubTotal);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);

  // Variables
  const user = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));
  const { saleTotal, change } = React.useMemo(
    () => configureVariables({ transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer }),
    [transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer]
  );

  const paymentButtons = React.useMemo(() => {
    const intersected = intersectionWith(paymentOptions, user?.user_permissions, (arrVal, othVal) => {
      return isEqual(arrVal.name, othVal);
    });
    const allIntersected = intersectionWith(intersected, activePayments, (arrVal, othVal) => {
      return isEqual(arrVal.name, othVal);
    });

    return allIntersected;
  }, [activePayments, user?.user_permissions]);

  const deliveryLocationIsEmpty = deliveryTypeSelected === "Delivery" && !deliveryLocationInputted;
  const deliveryChargeIsEmpty = deliveryTypeSelected === "Delivery" && !deliveryCharge;
  const [processingDeliveryCharge, setProcessingDeliveryCharge] = React.useState(false);

  // console.log({ cartSubTotal });
  // console.log({ outletSelected });

  //Select outlet
  React.useEffect(() => {
    const upperCaseMerchantGroup = upperCase(user?.user_merchant_group);
    if (upperCaseMerchantGroup === "ADMINISTRATORS") {
      if (outlets?.length === 1) {
        dispatch(setOutletSelected(outlets[0]));
      }
    } else {
      const response = intersectionWith(filter(outlets, Boolean), user?.user_assigned_outlets ?? [], (arrVal, othVal) => {
        return arrVal.outlet_id === othVal;
      });

      if (response.length === 1) {
        dispatch(setOutletSelected(response[0]));
      }
    }
  }, [outlets]);

  return (
    <div>
      {/* Back To sale */}
      <p className="mt-4 mb-4 text-right ">
        <button
          className="text-lg font-bold focus:outline-none"
          onClick={() => {
            dispatch(onClickToCheckout());
            // dispatch(setProductsOnHold());
          }}
        >
          <i className="mr-1 fas fa-arrow-left "></i>
          <span>Back to Sale</span>
        </button>{" "}
      </p>
      {/* Back To sale */}

      {/* Pay Field */}
      <div className="flex items-center justify-between">
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
            className="relative text-2xl bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none"
          />
        </div>
      </div>
      {/* Pay Field */}

      {/* Outlets */}
      {outlets.length > 1 && (
        <div className="mt-4">
          <h1 className="mb-1 font-semibold">Outlets</h1>
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
            {outlets.map((outlet) => {
              return (
                <button
                  // disabled={!!deliveryCharge} //TODO: disable changing outlets when delivery charge has been calculated
                  key={outlet.outlet_name}
                  className={`${
                    outletSelected?.outlet_name === outlet.outlet_name ? "ring-2" : ""
                  } w-36 h-24 border border-gray-300 focus:outline-none rounded shadow overflow-hidden font-bold px-2 break-words`}
                  onClick={() => {
                    // if (!outletSelected) {
                    //   return
                    // }
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
        <h1 className="mb-1 font-semibold">Pickup or Delivery?</h1>
        <div className="grid grid-cols-3 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
          {merchantUserDeliveryOptions
            .filter((option) => {
              if (option.name === "Dine In") {
                if (["67", "68"].includes(user?.user_merchant_cat_id)) {
                  return true;
                } else return false;
              }
              return true;
            })
            .map((option) => {
              return (
                <button
                  key={option.name}
                  // disabled={!!outletSelected} //TODO: if no outlet selected ie user has more than one outlet
                  className={`${
                    deliveryTypeSelected === option.name ? "ring-2" : ""
                  } w-36 h-24 border border-gray-300 text-lg focus:outline-none rounded shadow overflow-hidden font-bold px-2 break-words`}
                  onClick={() => {
                    if (!outletSelected) {
                      addToast(`Please select an outlet`, { appearance: `info`, autoDismiss: true });
                    } else {
                      if (option?.name !== "Delivery") {
                        dispatch(setDeliveryCharge(null));
                        dispatch(setDeliveryNotes(""));
                        dispatch(setDeliveryLocationInputted(null));

                        if (promoType === "DELIVERY") {
                          dispatch(setCartPromoCode(null));
                          dispatch(setPromoType(""));
                          dispatch(setPromoAmount(0));
                        }
                      }

                      if (option?.name === "Delivery" && Number(payerAmountEntered) === 0) {
                        return addToast(`You must remove payment options entered to change delivery type`, {
                          appearance: "info",
                          autoDismiss: true,
                        });
                      }

                      dispatch(setDeliveryTypeSelected(option?.name));
                    }
                  }}
                >
                  {option.name}
                </button>
              );
            })}
        </div>

        {["Delivery"].includes(deliveryTypeSelected) && (
          <div className="mt-4">
            <TypeDelivery
              setFetching={setFetching}
              processingDeliveryCharge={processingDeliveryCharge}
              setProcessingDeliveryCharge={setProcessingDeliveryCharge}
            />
          </div>
        )}
      </div>
      {/* Delivery Options */}

      {/* Payment Buttons */}
      <div className="grid grid-cols-3 gap-3 my-4 mt-8 xl:grid-cols-3 2xl:grid-cols-4">
        {paymentButtons.map((paymentButton) => {
          return (
            <div key={paymentButton.name}>
              <button
                // disabled={!payerAmountEntered || Number(payerAmountEntered) === 0}
                className={`${
                  paymentMethodSet === paymentButton.name ? "ring-4" : ""
                }  w-40 h-12 font-bold bg-blue-500 text-white focus:outline-none rounded shadow-sm overflow-hidden px-2 break-words`}
                onClick={() => {
                  if (!deliveryTypeSelected) {
                    return addToast(`Select pickup or delivery type before payment`, {
                      appearance: "info",
                      autoDismiss: true,
                    });
                  } else if (Number(payerAmountEntered) === 0) {
                    return addToast(`You must delete currently selected payment to select a different one`, {
                      appearance: "info",
                      autoDismiss: true,
                    });
                  } else {
                    dispatch(setPaymentMethodSet(paymentButton.name));
                    setOpenPhoneNumberInputModal(true);
                  }
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

      {/* Customer */}
      {currentCustomer ? (
        <div className="w-full mt-4">
          <h1 className="mb-1 text-sm font-semibold">Current Customer</h1>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">{currentCustomer.customer_name}</span>
              <span className="ml-2 text-xs">{currentCustomer.customer_email}</span>
              <span className="ml-2 text-xs">{currentCustomer.customer_phone}</span>
            </div>
            <div>
              <button
                className="font-bold focus:outline-none"
                onClick={() => {
                  dispatch(addCustomer(null));
                }}
              >
                <i className="text-red-500 fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="z-10 w-full mt-4">
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
                    className="w-full px-6 py-4 font-semibold text-center text-gray-200 bg-gray-400 rounded focus:outline-none"
                  >
                    {loyaltyTab}
                  </button>
                </div>
              );
            })}
          </div> */}

      {["Delivery", "Pickup"].includes(deliveryTypeSelected) && !currentCustomer && (
        <div className="font-bold text-center text-red-500">
          <p>You need to add a customer to this delivery type to proceed</p>
        </div>
      )}

      {/* Raise Order Button */}
      <div className="self-end w-full mt-5">
        <button
          disabled={
            processingDeliveryCharge ||
            fetching ||
            !deliveryTypeSelected ||
            deliveryLocationIsEmpty ||
            !amountReceivedFromPayer ||
            !outletSelected ||
            (["Delivery", "Pickup"].includes(deliveryTypeSelected) && !currentCustomer) ||
            deliveryChargeIsEmpty ||
            change > 0
          }
          className={`${
            processingDeliveryCharge ||
            fetching ||
            !deliveryTypeSelected ||
            deliveryLocationIsEmpty ||
            !amountReceivedFromPayer ||
            !outletSelected ||
            (["Delivery", "Pickup"].includes(deliveryTypeSelected) && !currentCustomer) ||
            deliveryChargeIsEmpty ||
            change > 0
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
          Complete Sale
        </button>
        {processError && <p className="text-sm text-center text-red-500">{processError}</p>}
      </div>
    </div>
  );
};

export default ProcessPayment;

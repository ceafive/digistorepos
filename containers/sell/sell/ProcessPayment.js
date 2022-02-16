// import AddCustomerProcessPayment from "components/Cart/AddCustomerProcessPayment";
// import TypeDelivery from "components/Sell/Sell/TypeDelivery";
// import Spinner from "components/Spinner";
import axios from "axios";
import {
  addCustomer,
  onClickToCheckout,
  setBookingClientInformation,
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
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { configureVariables, merchantUserDeliveryOptions, paymentOptionNames, paymentOptions } from "utils";

const Spinner = dynamic(() => import("components/Spinner"));
const TypeDelivery = dynamic(() => import("containers/sell/sell/TypeDelivery"));
const AddCustomerProcessPayment = dynamic(() => import("containers/sell/sell/cart/AddCustomerProcessPayment"));

const ProcessPayment = ({
  handleRaiseOrder,
  setOpenPhoneNumberInputModal,
  payerAmountEntered,
  setPayerAmountEntered,
  fetching,
  setFetching,
  processError,
  handlePayment,
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
  const deliveryTypes = useSelector((state) => state.cart.deliveryTypes);
  const bookingClientInformation = useSelector((state) => state.cart.bookingClientInformation);

  // console.log(deliveryTypes);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm({
    mode: "all",
    defaultValues: {
      ...bookingClientInformation,
    },
  });

  const watchBookingPhoneNumber = watch("phone", "");

  // Variables
  const user = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));
  // if account is a booking account
  const isBooking = user?.user_permissions?.includes("BUKNSMGT") ? true : false || false;

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

  //State
  const [processingDeliveryCharge, setProcessingDeliveryCharge] = React.useState(false);
  const [regions] = React.useState([
    {
      name: `Ahafo Region`,
      value: "Ahafo Region",
    },
    {
      name: `Ashanti Region`,
      value: "Ashanti Region",
    },
    {
      name: `Bono East Region`,
      value: "Bono East Region",
    },
    {
      name: `Bono Region`,
      value: "Bono Region",
    },
    {
      name: `Central Region`,
      value: "Central Region",
    },
    {
      name: `Eastern Region`,
      value: "Eastern Region",
    },
    {
      name: `Greater Accra Region`,
      value: "Greater Accra Region",
    },
    {
      name: `North East Region`,
      value: "North East Region",
    },
    {
      name: `Northern Region`,
      value: "Northern Region",
    },
    {
      name: `Oti Region`,
      value: "Oti Region",
    },
    {
      name: `Savannah Region`,
      value: "Savannah Region",
    },
    {
      name: `Upper East Region`,
      value: "Upper East Region",
    },
    {
      name: `Upper West Region`,
      value: "Upper West Region",
    },
    {
      name: `Volta Region`,
      value: "Volta Region",
    },
    {
      name: `Western North Region`,
      value: "Western North Region",
    },

    {
      name: `Western Region`,
      value: "Western Region",
    },
  ]);

  // console.log({ cartSubTotal });
  // console.log({ outletSelected });

  // //Select outlet
  // React.useEffect(() => {
  //   const upperCaseMerchantGroup = upperCase(user?.user_merchant_group);
  //   if (upperCaseMerchantGroup === "ADMINISTRATORS") {
  //     if (outlets?.length === 1) {
  //       dispatch(setOutletSelected(outlets[0]));
  //     }
  //   } else {
  //     const response = intersectionWith(filter(outlets, Boolean), user?.user_assigned_outlets ?? [], (arrVal, othVal) => {
  //       return arrVal.outlet_id === othVal;
  //     });

  //     if (response.length === 1) {
  //       dispatch(setOutletSelected(response[0]));
  //     }
  //   }
  // }, [outlets]);

  React.useEffect(() => {
    if (watchBookingPhoneNumber?.length === 10) {
      (async () => {
        const response = await axios.post("/api/sell/sell/get-a-customer", { phoneNumber: watchBookingPhoneNumber });
        const responsedata = await response?.data;
        // console.log(responsedata);

        if (Number(responsedata?.status) === 0) {
          setValue(`email`, responsedata?.data?.customer_email || "");
          setValue(`studentName`, responsedata?.data?.customer_name || "");
        }
      })();
    }

    return () => {};
  }, [watchBookingPhoneNumber]);

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
      {/* {outlets.length > 1 && (
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

                    if (Number(payerAmountEntered) === 0) {
                      return addToast(`You must remove payment option(s) entered to change outlet`, {
                        appearance: "info",
                        autoDismiss: true,
                      });
                    }

                    dispatch(setOutletSelected(outlet));
                  }}
                >
                  {outlet.outlet_name}
                </button>
              );
            })}
          </div>
        </div>
      )} */}
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
                      if (Number(payerAmountEntered) === 0) {
                        return addToast(`You must remove payment option(s) entered to change delivery type`, {
                          appearance: "info",
                          autoDismiss: true,
                        });
                      }

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
              payerAmountEntered={payerAmountEntered}
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
          // console.log(paymentButton);
          const generalClasses = `w-40 h-12 font-bold text-white focus:outline-none rounded shadow-sm overflow-hidden px-2 break-words`;
          const enableClasses = `bg-blue-500`;
          const disabledClasses = `bg-gray-200`;
          const applyDisabledClasses =
            paymentButton.name === "CASH" && deliveryTypes["option_delivery"] === "IPAY" && deliveryTypeSelected === "Delivery";
          return (
            <div key={paymentButton.name}>
              <button
                // disabled={!payerAmountEntered || Number(payerAmountEntered) === 0}
                className={`${paymentMethodSet === paymentButton.name ? "ring-4" : ""} ${generalClasses} ${
                  applyDisabledClasses ? disabledClasses : enableClasses
                }`}
                onClick={() => {
                  if (paymentButton.name === "CASH" && deliveryTypes["option_delivery"] === "IPAY" && deliveryTypeSelected === "Delivery") {
                    return addToast(`Cash payment not available for Digistore delivery`, {
                      appearance: "info",
                      autoDismiss: true,
                    });
                  }

                  if (!deliveryTypeSelected) {
                    return addToast(`Select pickup or delivery type before payment`, {
                      appearance: "info",
                      autoDismiss: true,
                    });
                  } else if (deliveryTypeSelected === "Delivery" && !deliveryCharge) {
                    return addToast(`You must select a delivery option`, {
                      appearance: "info",
                      autoDismiss: true,
                    });
                  } else if (Number(payerAmountEntered) === 0) {
                    return addToast(`You must delete currently selected payment to select a different one`, {
                      appearance: "info",
                      autoDismiss: true,
                    });
                  } else {
                    // show input modal for payments other than INVPAY
                    if (paymentButton.name === "INVPAY") {
                      dispatch(setPaymentMethodSet(paymentButton.name));
                      setOpenPhoneNumberInputModal(true);
                      // handlePayment({ INVPAY: "" });
                    } else {
                      dispatch(setPaymentMethodSet(paymentButton.name));
                      setOpenPhoneNumberInputModal(true);
                    }
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
      {isBooking ? (
        <div className="my-4  w-full">
          <h1 className="font-bold">Client Information</h1>

          <div className="w-full">
            <label htmlFor="">Name of University</label>
            <input
              {...register("uniName", {
                required: "University name is required",
              })}
              type="text"
              placeholder="University of Ghana"
              className="bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none w-full"
            />
            <p className="text-xs text-red-500">{errors?.uniName?.message}</p>
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            <div className="w-11/12">
              <label htmlFor="">Name of Student</label>
              <input
                {...register("studentName", {
                  required: "Student name is required",
                })}
                type="text"
                placeholder="John Doe"
                className="bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none w-full"
              />
              <p className="text-xs text-red-500">{errors?.studentName?.message}</p>
            </div>

            <div className="w-11/12">
              <label htmlFor="">Student ID Number</label>
              <input
                {...register("studentIDNumber", {
                  required: "Student ID number is required",
                })}
                type="text"
                placeholder="XX1234567890"
                className="bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none w-full"
              />
              <p className="text-xs text-red-500">{errors?.studentIDNumber?.message}</p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            <div className="w-11/12">
              <label htmlFor="">Mobile Phone</label>
              <input
                {...register("phone", {
                  required: "Phone number is required",
                  minLength: {
                    value: 10,
                    message: "Phone number must be 10 chars",
                  },
                  maxLength: {
                    value: 10,
                    message: "Phone number must be 10 chars",
                  },
                })}
                type="number"
                placeholder="0244454545"
                min="1"
                className="bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none w-full"
              />
              <p className="text-xs text-red-500">{errors?.phone?.message}</p>
            </div>

            <div className="w-11/12">
              <label htmlFor="">Email</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="johndoe@mail.com"
                className="bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none w-full"
              />
              <p className="text-xs text-red-500">{errors?.email?.message}</p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            <div className="w-11/12">
              <label htmlFor="">Region of Residence</label>
              <select
                {...register("studentRegion", {
                  required: "Region of residence is required",
                })}
                className="bg-white border border-blue-500 placeholder-blueGray-300 text-blueGray-600 py-2 rounded shadow focus:outline-none w-full"
              >
                <option value="" disabled>{`Select ${"region"}`}</option>
                {regions.map((variantValue) => (
                  <option key={variantValue?.name} value={variantValue?.value}>
                    {variantValue?.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500">{errors?.studentRegion?.message}</p>
            </div>

            <div className="w-11/12">
              <label htmlFor="">Hall of Residence (if applicable)</label>
              <input
                {...register("studentHall", {})}
                type="text"
                placeholder="Casely-Hayford"
                className="bg-white border border-blue-500 rounded shadow placeholder-blueGray-300 text-blueGray-600 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}

      {(["Delivery", "Pickup"].includes(deliveryTypeSelected) && !currentCustomer) ||
        (paymentMethodSet === "INVPAY" && !currentCustomer && (
          <div className="font-bold text-center text-red-500">
            <p>You need to add a customer to this delivery/payment type to proceed</p>
          </div>
        ))}

      {/* Customer */}
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
            (paymentMethodSet === "INVPAY" && !currentCustomer) ||
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
            (paymentMethodSet === "INVPAY" && !currentCustomer) ||
            deliveryChargeIsEmpty ||
            change > 0
              ? "bg-gray-200"
              : "bg-green-700"
          } px-6 py-4 text-white font-semibold rounded focus:outline-none w-full text-center`}
          // onClick={handleRaiseOrder}

          onClick={handleSubmit((values) => {
            dispatch(setBookingClientInformation(values));
            handleRaiseOrder(values);
          })}
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

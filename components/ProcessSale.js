import {
  onClickToCheckout,
  onRemovePaymentMethod,
  onResetCart,
  setActivePayments,
  setAmountReceivedFromPayer,
  setTransactionFeeCharges,
} from "features/cart/cartSlice";
import { find, intersectionWith, isEqual, reduce, upperCase } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Modal from "components/Modal";
import CashPaymentModal from "./Cart/CashPaymentModal";
import { setAllOutlets, setOutletSelected } from "features/products/productsSlice";
import axios from "axios";
import { forEach } from "p-iteration";
import CollectUserDetail from "./Cart/CollectUserDetail";
import AddCustomer from "./Cart/AddCustomer";
import TypeDelivery from "./TypeDelivery";

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

const merchantUserDeliveryOptions = [
  { name: "Dine-In" },
  { name: "Pickup" },
  { name: "DeliveryDeliveryDeliveryDeliveryDeliveryDeliveryDelivery" },
];

// const paymentOptions = [
//   {
//     "Receive Payment": "RCPAYMT",
//     "Cash Payment": "CASH",
//     "Card Payment": "VISAG",
//     "QR Payment": "QRPAY",
//     "Bank Transfer": "BNKTR",
//     "Mobile Money Payment": {
//       "MTN Mobile Money": "MTNMM",
//       "AirtelTigo Money": "TIGOC",
//       "Vodafone Cash": "VODAC",
//       "GCB Money": "GCBMM",
//     },
//   },
// ];

// const paymentButtons = [
//   {
//     name: "Mobile Money",
//     children: [
//       { name: "MTN", color: "black", bgColor: "yellow" },
//       { name: "Vodafone", color: "white", bgColor: "red" },
//       { name: "Airtel Tigo", color: "white", bgColor: "blue" },
//     ],
//   },
//   { name: "Credit Card" },
//   { name: "Cash" },
//   { name: "Bank Transfer" },
//   // "Cheque",
//   // "Credit",
// ];

const loyaltyTabs = ["Loyalty", "Layby", "Store Credit", "On Account"];

const ProcessSale = () => {
  const dispatch = useDispatch();
  const {
    formState: { errors },
    register,
    watch,
    handleSubmit,
    reset,
  } = useForm({
    mode: "all",
  });

  // Selectors
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartNote = useSelector((state) => state.cart.cartNote);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const cartTotalMinusDiscount = useSelector((state) => state.cart.cartTotalMinusDiscount);
  const productsInCart = useSelector((state) => state.cart.productsInCart);
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const cartDiscountOnCartTotal = useSelector((state) => state.cart.cartDiscountOnCartTotal);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const paymentMethodsAndAmount = useSelector((state) => state.cart.paymentMethodsAndAmount);
  const cartDiscount = useSelector((state) => state.cart.cartDiscount);
  const outlets = useSelector((state) => state.products.outlets);
  const transactionFeeCharges = useSelector((state) => state.cart.transactionFeeCharges);
  const totalItemsInCart = useSelector((state) => state.cart.totalItemsInCart);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const activePayments = useSelector((state) => state.cart.activePayments);
  const cartPromoDiscount = useSelector((state) => state.cart.cartPromoDiscount);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);

  // console.log(activePayments);

  // Component State
  const [step, setStep] = React.useState(0);
  const [paymentMethodSet, setPaymentMethodSet] = React.useState("");
  const [payerAmountEntered, setPayerAmountEntered] = React.useState(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer);
  const [openCashModal, setOpenCashModal] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [openPhoneNumberInputModal, setOpenPhoneNumberInputModal] = React.useState(false);
  const [pickupOrDelivery, setPickupOrDelivery] = React.useState(null);

  // console.log({ pickupOrDelivery });

  // Variables
  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));
  const lengthOfMobileNumber = 10;
  const watchMobileMoneyNumber = watch("mobileMoneyNumber", "");
  const watchPhoneOrEmailAddress = watch("phoneOrEmailAddress", "");
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

  // console.log(paymentButtons);

  React.useEffect(() => {
    setPayerAmountEntered(
      Number(
        parseFloat(
          amountReceivedFromPayer >= cartTotalMinusDiscountPlusTax ? 0 : cartTotalMinusDiscountPlusTax - amountReceivedFromPayer
        ).toFixed(2)
      )
    );
  }, [amountReceivedFromPayer, cartTotalMinusDiscountPlusTax]);

  const fetchFeeCharges = async (userPaymentMethods) => {
    try {
      setFetching(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const feeCharges = [];

      await forEach(userPaymentMethods, async (paymentMethod) => {
        const res = await axios.post("/api/products/get-transaction-fee-charges", {
          merchant: user["user_merchant_id"],
          channel: paymentMethod.method,
          amount: paymentMethod.amount,
        });
        const response = await res.data;
        feeCharges.push(response);
      });
      dispatch(setTransactionFeeCharges(feeCharges));
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const onAddPayment = () => {
    try {
      fetchFeeCharges([
        ...paymentMethodsAndAmount,
        {
          method: paymentMethodSet,
          amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
        },
      ]);
      if (paymentMethodSet === "CASH") {
        if (payerAmountEntered === cartTotalMinusDiscountPlusTax) {
          dispatch(
            setAmountReceivedFromPayer({
              method: paymentMethodSet,
              amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
            })
          );
        } else setOpenCashModal(true);
      } else {
        dispatch(
          setAmountReceivedFromPayer({
            method: paymentMethodSet,
            amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
          })
        );
      }
      // reset({
      //   mobileMoneyNumber: "",
      //   phoneOrEmailAddress: "",
      // });
      setOpenPhoneNumberInputModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal open={openCashModal} onClose={() => setOpenCashModal(false)} maxWidth="sm">
        <CashPaymentModal
          onClose={() => setOpenCashModal(false)}
          payerAmountEntered={payerAmountEntered}
          cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax}
        />
      </Modal>
      <Modal open={openPhoneNumberInputModal} onClose={() => setOpenPhoneNumberInputModal(false)} maxWidth="sm">
        <CollectUserDetail
          onAddPayment={onAddPayment}
          paymentMethodSet={paymentMethodSet}
          register={register}
          handleSubmit={handleSubmit}
          lengthOfMobileNumber={lengthOfMobileNumber}
          errors={errors}
          onClose={() => setOpenPhoneNumberInputModal(false)}
        />
      </Modal>
      <div className="flex m-4 divide-x divide-gray-200 bg-white rounded shadow">
        <div className="w-2/5 p-6">
          <div className="flex items-center font-semibold text-xl">
            <p className="">Sale Summary</p>
          </div>

          <div className="mt-4">
            {productsInCart.map((product, index) => {
              return (
                <div key={product.uniqueId} className="w-full flex justify-between font-bold my-4">
                  <div>
                    <span className="mr-6">{index + 1}.</span>
                    <span>{upperCase(product.title)}</span>
                  </div>
                  <p>GHC{product.totalPrice}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <p>Note:</p>
            <p>{cartNote}</p>
          </div>

          <hr className="mt-6 mb-5" />

          {/* Sub amount figures */}
          <div className="pl-5 xl:pl-20">
            <div className="flex justify-between">
              <p>Sub-total</p>
              <p>GHC{totalPriceInCart}</p>
            </div>

            <div className="flex justify-between">
              <p>Discount</p>
              <p>GHC{cartDiscountOnCartTotal}</p>
            </div>

            <div className="flex justify-between">
              <p>Promo Amount</p>
              <p>GHC{cartPromoDiscount}</p>
            </div>

            <div className="flex justify-between pt-4">
              <p>Total before tax</p>
              <p>GHC{cartTotalMinusDiscount}</p>
            </div>

            <div className="flex justify-between">
              <p>Tax COVID-19 Levy 4%</p>
              <p>GHC{covidTax}</p>
            </div>
          </div>

          <hr className="mt-5 mb-5" />

          <div className="flex justify-between items-center">
            <p>
              <span className="font-bold text-xl tracking-wide mr-4">SALE TOTAL</span>
              <span className="text-sm">{totalItemsInCart} item(s)</span>
            </p>
            <p>GHC{cartTotalMinusDiscountPlusTax}</p>
          </div>

          <hr className="mt-5 mb-5" />

          <div className="pl-5 xl:pl-20">
            {paymentMethodsAndAmount.map((paymentMethod, index) => {
              const fee = find(transactionFeeCharges, { service: paymentMethod.method });
              const showWatchMobileMoneyNumber =
                paymentMethod.method === "MTNMM" || paymentMethod.method === "TIGOC" || paymentMethod.method === "VODAC";
              const showWatchPhoneOrEmailAddress =
                paymentMethod.method === "CASH" || paymentMethod.method === "VISAG" || paymentMethod.method === "QRPAY";
              return (
                <div key={paymentMethod.method + index} className="flex justify-between my-4">
                  <div>
                    <p>{paymentMethod.method}</p>
                    {fee ? <p className="text-sm">Fee: GHC{fee?.charge}</p> : <></>}
                    {watchMobileMoneyNumber || watchPhoneOrEmailAddress ? (
                      <p className="text-sm">Contact: {showWatchMobileMoneyNumber ? watchMobileMoneyNumber : watchPhoneOrEmailAddress}</p>
                    ) : (
                      <></>
                    )}
                    <p className="text-sm">{paymentMethod.date}</p>
                  </div>
                  <div>
                    <span>GHC{paymentMethod.amount}</span>
                    <button
                      className="focus:outline-none"
                      onClick={() => {
                        dispatch(onRemovePaymentMethod(paymentMethod));
                      }}
                    >
                      <i className="fas fa-minus-circle ml-2 text-red-500"></i>
                    </button>
                  </div>
                </div>
              );
            })}

            {transactionFeeCharges.length > 0 ? (
              <>
                {paymentMethodsAndAmount.length > 0 && <hr className="mt-5 mb-5" />}
                <div className="flex justify-between items-center">
                  <p className="font-bold text-xl tracking-wide mr-4">FEES</p>
                  <p>
                    GHC
                    {reduce(transactionFeeCharges, (sum, n) => sum + Number(parseFloat(n?.charge)), 0)}
                  </p>
                </div>
              </>
            ) : (
              <> </>
            )}

            {deliveryCharge ? (
              <>
                {transactionFeeCharges.length > 0 && <hr className="mt-5 mb-5" />}
                <div className="flex justify-between items-center">
                  <p className="font-bold text-xl tracking-wide mr-4">DELIVERY FEE</p>
                  <p>
                    GHC
                    {deliveryCharge?.price}
                  </p>
                </div>
              </>
            ) : (
              <> </>
            )}

            {amountReceivedFromPayer ? (
              <>
                <hr className="mt-5 mb-5" />
                <div className="flex justify-between items-center">
                  <p className="font-bold text-xl tracking-wide mr-4">BALANCE</p>
                  <p>
                    GHC
                    {Number(parseFloat(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer).toFixed(2))}
                  </p>
                </div>
              </>
            ) : (
              <> </>
            )}
          </div>
        </div>

        {/* Right part */}
        <div className="w-3/5 p-6 pt-0" style={{ height: 800 }}>
          <p className="text-right mt-4 mb-4 ">
            {step !== 2 && (
              <button
                className="font-bold text-lg focus:outline-none"
                onClick={() => {
                  dispatch(onClickToCheckout());
                }}
              >
                <i className="fas fa-arrow-left mr-1 "></i>
                <span>Back to Sale</span>
              </button>
            )}
          </p>

          {step === 0 && (
            <div>
              <div className="flex justify-between items-center">
                <p className="text-5xl">Pay</p>
                <div>
                  <input
                    value={payerAmountEntered}
                    readOnly={amountReceivedFromPayer >= cartTotalMinusDiscountPlusTax}
                    onChange={(e) => {
                      e.persist();
                      setPayerAmountEntered(e.target.value);
                    }}
                    type="number"
                    placeholder="Enter an amount"
                    className="border border-blue-500 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded shadow focus:outline-none text-right text-2xl"
                  />
                  {/* <button className="ml-2 bg-green-500 px-2 py-1 text-white rounded">Give Change</button> */}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 my-4 mt-8">
                {paymentButtons.map((paymentButton) => {
                  return (
                    <div key={paymentButton.name} className="">
                      <button
                        disabled={!payerAmountEntered || payerAmountEntered === "0"}
                        className="w-32 h-24 border border-gray-300 rounded shadow overflow-hidden whitespace-normal"
                        onClick={() => {
                          setPaymentMethodSet(paymentButton.name);
                          setOpenPhoneNumberInputModal(true);
                        }}
                      >
                        <img className="w-full h-full" src={paymentButton.img} alt={paymentButton.name} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {outlets.length > 1 && (
                <>
                  <h1 className="font-semibold mb-1">Outlets</h1>
                  <div className="grid grid-cols-4 gap-2">
                    {outlets.map((outlet) => {
                      return (
                        <div key={outlet.outlet_name} className="">
                          <button
                            className="w-36 h-24 border border-gray-300 rounded shadow overflow-hidden font-bold whitespace-normal"
                            onClick={() => {
                              dispatch(setOutletSelected(outlet));
                            }}
                          >
                            {outlet.outlet_name}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Delivery Options */}
              <div>
                <h1 className="font-semibold mb-1">Pickup or Delivered?</h1>
                <div className="grid grid-cols-4 gap-2">
                  {merchantUserDeliveryOptions.map((option) => {
                    return (
                      <div key={option.name} className="">
                        <button
                          className="w-36 h-24 border border-gray-300 rounded shadow overflow-hidden font-bold px-2 break-words"
                          onClick={() => {
                            setPickupOrDelivery(option.name);
                          }}
                        >
                          {option.name}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {pickupOrDelivery === "Delivery" && (
                  <div className="mt-4">
                    <TypeDelivery />
                  </div>
                )}
              </div>
              {/* Delivery Options */}

              {currentCustomer ? (
                <div className="w-full mt-4">
                  <h1 className="font-semibold mb-1 text-sm">Current Customer</h1>
                  <div className="flex items-center">
                    <span className="font-bold">{currentCustomer.customer_name}</span>
                    <span className="text-xs ml-2">{currentCustomer.customer_email}</span>
                    <span className="text-xs ml-2">{currentCustomer.customer_phone}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full mt-4">
                  <div className="w-full  z-10">
                    <AddCustomer />
                  </div>
                  {/* <span className="z-10 absolute text-center text-blue-500 w-8 pl-3 py-3">
                    <i className="fas fa-user-alt"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="Add a customer to pay with the following options:"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                  /> */}
                </div>
              )}
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
                  // disabled={
                  //   !amountReceivedFromPayer ||
                  //   (paymentMethodSet !== "CASH" && (!watchMobileMoneyNumber || watchMobileMoneyNumber?.length !== lengthOfMobileNumber))
                  // }
                  // className={`${
                  //   !amountReceivedFromPayer ||
                  //   (paymentMethodSet !== "CASH" && (!watchMobileMoneyNumber || watchMobileMoneyNumber?.length !== lengthOfMobileNumber))
                  //     ? "bg-gray-400 text-gray-300"
                  //     : "bg-green-700 text-white"
                  // } px-6 py-4 font-semibold rounded focus:outline-none w-full text-center`}
                  disabled={!amountReceivedFromPayer}
                  className={`${
                    !amountReceivedFromPayer ? "bg-gray-400 text-gray-300" : "bg-green-700 text-white"
                  } px-6 py-4 font-semibold rounded focus:outline-none w-full text-center`}
                  onClick={() => {
                    if (paymentMethodSet === "CASH") {
                      setStep(2);
                    } else setStep(1);
                  }}
                >
                  Raise Order
                </button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="p-20 text-center">
              <p className="font-bold text-4xl">Awaiting Payment</p>
              <div>
                <p>
                  <span>Instructions: </span>
                  <span>Check phone to complete</span>
                </p>
              </div>

              <div className="w-full self-end mt-20">
                <button
                  className="bg-green-700 px-6 py-4 text-white font-semibold rounded focus:outline-none w-full text-center"
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-20 text-center">
              <p className="font-bold text-4xl">Payment Received</p>
              <div>
                {Number(
                  parseFloat(
                    amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0
                      ? 0
                      : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
                  ).toFixed(2)
                ) > 0 && (
                  <p>
                    <span>Change to give to customer: </span>
                    <span>
                      GHS
                      {Number(
                        parseFloat(
                          amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0
                            ? 0
                            : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
                        ).toFixed(2)
                      )}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex justify-center mt-24 text-sm font-semibold">
                <div className="flex justify-between w-full">
                  <div>
                    <span className="text-gray-800 w-6 mr-1">
                      <i className="fas fa-print"></i>
                    </span>
                    <span>Print</span>
                  </div>

                  <div>
                    <span className="text-gray-800 w-6 mr-1">
                      <i className="fas fa-gift"></i>
                    </span>
                    <span>Gift Receipt</span>
                  </div>

                  <div>
                    <span className="text-gray-800 w-6 mr-1">
                      <i className="fas fa-gift"></i>
                    </span>
                    <span>Other...</span>
                  </div>
                </div>
              </div>
              <div className="mt-12 text-sm font-semibold">
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
              </div>

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
          )}
        </div>
      </div>
    </>
  );
};

export default ProcessSale;

import { onClickToCheckout, onRemovePaymentMethod, onResetCart, setAmountReceivedFromPayer } from "features/cart/cartSlice";

import { intersectionWith, isEqual, upperCase } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Modal from "components/Modal";
import CashPaymentModal from "./Cart/CashPaymentModal";

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

const MoMoInput = ({ paymentMethodSet, register, lengthOfMobileNumber, errors }) => {
  return (
    <div className="my-4">
      <label className="mb-1" htmlFor="">
        Enter Mobile number
      </label>
      <input
        type="text"
        {...register("mobileMoneyNumber", {
          // required: true,
          minLength: {
            value: lengthOfMobileNumber,
            message: "Cannot be shorter than 10 chars",
          },
          maxLength: {
            value: lengthOfMobileNumber,
            message: "Cannot be longer than 10 chars",
          },
          validate: {
            cannotBeEmpty: (value) =>
              (paymentMethodSet === "MTNMM" || paymentMethodSet === "TIGOC" || paymentMethodSet === "VODAC") && !value
                ? "Please enter mobile number"
                : "",
          },
        })}
        placeholder="eg. 0547748484"
        className="border border-blue-500 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors?.mobileMoneyNumber?.message}</p>
    </div>
  );
};

const ProcessSale = () => {
  const dispatch = useDispatch();
  const {
    formState: { errors },
    register,
    watch,
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

  // console.log(cartDiscountOnCartTotal);

  // Component State
  const [step, setStep] = React.useState(0);
  const [paymentMethodSet, setPaymentMethodSet] = React.useState("");
  const [payerAmountEntered, setPayerAmountEntered] = React.useState(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer);
  const [giveChange, setGiveChange] = React.useState(false);
  const [openCashModal, setOpenCashModal] = React.useState(false);

  // Variables
  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));
  const lengthOfMobileNumber = 10;
  const watchMobileMoneyNumber = watch("mobileMoneyNumber", "");
  const userDetails = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));
  const paymentButtons = intersectionWith(paymentOptions, userDetails?.user_permissions, (arrVal, othVal) => {
    return isEqual(arrVal.name, othVal);
  });

  React.useEffect(() => {
    setPayerAmountEntered(
      Number(
        parseFloat(
          amountReceivedFromPayer >= cartTotalMinusDiscountPlusTax ? 0 : cartTotalMinusDiscountPlusTax - amountReceivedFromPayer
        ).toFixed(2)
      )
    );
  }, [amountReceivedFromPayer, cartTotalMinusDiscountPlusTax]);

  console.log({ paymentMethodsAndAmount });

  return (
    <>
      <Modal open={openCashModal} onClose={() => setOpenCashModal(false)}>
        <CashPaymentModal
          onClose={() => setOpenCashModal(false)}
          payerAmountEntered={payerAmountEntered}
          cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax}
        />
      </Modal>
      <div className="flex m-4 max-h-1/2 divide-x divide-gray-200 bg-white rounded shadow">
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
          <div className="pl-20">
            <div className="flex justify-between">
              <p>Sub-total</p>
              <p>GHC{totalPriceInCart}</p>
            </div>

            <div className="flex justify-between">
              <p>Discount</p>
              <p>GHC{cartDiscountOnCartTotal}</p>
            </div>

            <div className="flex justify-between pt-4">
              <p>Total before tax</p>
              <p>GHC{cartTotalMinusDiscount}</p>
            </div>

            <div className="flex justify-between">
              <p>Tax VAT COVID-19 Levy 4%</p>
              <p>GHC{covidTax}</p>
            </div>
          </div>

          <hr className="mt-10 mb-5" />

          <div className="">
            <div className="flex justify-between items-center">
              <p>
                <span className="font-bold text-xl tracking-wide mr-4">{upperCase("sale total")}</span>
                <span className="text-sm">2 items</span>
              </p>
              <p>GHC{cartTotalMinusDiscountPlusTax}</p>
            </div>
          </div>

          <hr className="mt-10 mb-5" />

          <div className="pl-20">
            {paymentMethodsAndAmount.map((paymentMethod, index) => {
              return (
                <div key={paymentMethod.method + index} className="flex justify-between my-4">
                  <div>
                    <p>{paymentMethod.method}</p>
                    <p className="text-sm">{paymentMethod.date}</p>
                  </div>
                  <div>
                    <span>GHC{paymentMethod.amount}</span>
                    <button
                      className="focus:outline-none"
                      onClick={() => {
                        dispatch(onRemovePaymentMethod());
                      }}
                    >
                      <i className="fas fa-minus-circle ml-2 text-red-500"></i>
                    </button>
                  </div>
                </div>
              );
            })}

            {amountReceivedFromPayer ? (
              <>
                <hr className="mt-10 mb-5" />
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
                    className="border border-blue-500 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded shadow focus:outline-none text-right text-xl"
                  />
                  <button className="ml-2 bg-green-500 px-2 py-1 text-white rounded">Give Change</button>
                </div>
              </div>

              <div className="grid grid-cols-3 xl:grid-cols-6 gap-2 my-4 mt-8">
                {paymentButtons.map((paymentButton) => {
                  return (
                    <div key={paymentButton.name} className="">
                      <button
                        disabled={!payerAmountEntered || payerAmountEntered === "0"}
                        className="w-32 h-24 border border-gray-300 rounded shadow overflow-hidden"
                        onClick={() => {
                          setPaymentMethodSet(paymentButton.name);
                          if (paymentButton.name === "CASH") {
                            setOpenCashModal(true);
                          } else {
                            dispatch(
                              setAmountReceivedFromPayer({
                                method: paymentButton.name,
                                amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
                              })
                            );
                          }
                        }}
                      >
                        <img className="w-full h-full" src={paymentButton.img} alt={paymentButton.name} />
                      </button>
                    </div>
                  );
                })}
                {/* <div className="">
                  <button
                    disabled={!payerAmountEntered || payerAmountEntered === "0"}
                    className="w-32 h-24 font-bold  p-4 bg-yellow-300 border border-gray-300 rounded shadow overflow-hidden"
                    onClick={() => {
                      const paymentName = "SPLIT_PAYMENT";
                      setPaymentMethodSet(paymentName);
                    }}
                  >
                    SPLIT PAYMENT
                  </button>
                </div> */}
              </div>

              {(paymentMethodSet === "MTNMM" || paymentMethodSet === "TIGOC" || paymentMethodSet === "VODAC") && (
                <MoMoInput
                  paymentMethodSet={paymentMethodSet}
                  register={register}
                  lengthOfMobileNumber={lengthOfMobileNumber}
                  errors={errors}
                />
              )}

              <div className="w-full">
                <span className="z-10 absolute text-center text-blue-500 w-8 pl-3 py-3">
                  <i className="fas fa-user-alt"></i>
                </span>
                <input
                  type="text"
                  placeholder="Add a customer to pay with the following options:"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                />
              </div>
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

              <div className="w-full self-end mt-4">
                <button
                  disabled={
                    !amountReceivedFromPayer ||
                    (paymentMethodSet === "Mobile Money" &&
                      (!watchMobileMoneyNumber || watchMobileMoneyNumber?.length !== lengthOfMobileNumber))
                  }
                  className={`${
                    !amountReceivedFromPayer ||
                    (paymentMethodSet !== "CASH" && (!watchMobileMoneyNumber || watchMobileMoneyNumber?.length !== lengthOfMobileNumber))
                      ? "bg-gray-400 text-gray-300"
                      : "bg-green-700 text-white"
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

import { onClickToCheckout, onRemovePaymentMethod, onResetCart, setAmountReceivedFromPayer } from "features/cart/cartSlice";

import { upperCase } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const paymentButtons = [
  {
    name: "Mobile Money",
    children: [
      { name: "MTN", color: "black", bgColor: "yellow" },
      { name: "Vodafone", color: "white", bgColor: "red" },
      { name: "Airtel Tigo", color: "white", bgColor: "blue" },
    ],
  },
  { name: "Credit Card" },
  { name: "Cash" },
  { name: "Bank Transfer" },
  // "Cheque",
  // "Credit",
];

const loyaltyTabs = ["Loyalty", "Layby", "Store Credit", "On Account"];

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

  // Component State
  const [step, setStep] = React.useState(0);
  const [paymentMethodSet, setPaymentMethodSet] = React.useState("");
  const [openSubButtons, setOpenSubButtons] = React.useState(false);
  const [payerAmountEntered, setPayerAmountEntered] = React.useState(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer);

  // Variables
  const covidTax = Number(parseFloat(totalTaxes * cartTotalMinusDiscount).toFixed(2));
  const lengthOfMobileNumber = 10;
  const watchMobileMoneyNumber = watch("mobileMoneyNumber", "");

  React.useEffect(() => {
    setPayerAmountEntered(
      amountReceivedFromPayer >= cartTotalMinusDiscountPlusTax ? 0 : cartTotalMinusDiscountPlusTax - amountReceivedFromPayer
    );
  }, [amountReceivedFromPayer, cartTotalMinusDiscountPlusTax]);

  return (
    <div className="flex m-4 max-h-1/2">
      <div className="w-1/2 p-6">
        <div className="flex items-center font-bold text-3xl">
          {step !== 2 && (
            <button
              className="focus:outline-none"
              onClick={() => {
                dispatch(onClickToCheckout());
              }}
            >
              <i className="fas fa-arrow-left mr-4 text-blueGray-400"></i>
            </button>
          )}
          <p>Sale</p>
        </div>

        <div className="mt-4">
          {productsInCart.map((product, index) => {
            return (
              <div key={product.id} className="w-full flex justify-between font-bold my-4">
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

          <hr className="mt-10 mb-5" />

          <div className="">
            <div className="flex justify-between items-center">
              <p>
                <span className="font-bold text-xl tracking-wide mr-4">{upperCase("Balance")}</span>
              </p>
              <p>
                GHC
                {Number(
                  parseFloat(
                    amountReceivedFromPayer - cartTotalMinusDiscountPlusTax <= 0
                      ? 0
                      : amountReceivedFromPayer - cartTotalMinusDiscountPlusTax
                  ).toFixed(2)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right part */}
      <div className="w-1/2 rounded shadow bg-white p-6" style={{ height: 800 }}>
        {step === 0 && (
          <div>
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl">Amount to pay</p>
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
                  className="border border-blue-500 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded shadow focus:outline-none focus:ring text-right text-3xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4 mt-8">
              {paymentButtons.map((paymentButton) => {
                return (
                  <div key={paymentButton.name} className="">
                    <button
                      key={paymentButton.name}
                      disabled={!payerAmountEntered || payerAmountEntered === "0"}
                      className={`${
                        payerAmountEntered && payerAmountEntered !== "0" ? "bg-green-700 text-white" : "bg-gray-400 text-gray-300"
                      } px-6 py-4 font-semibold rounded focus:outline-none w-full text-center`}
                      onClick={() => {
                        setPaymentMethodSet(paymentButton.name);
                        setOpenSubButtons(true);

                        if (!paymentButton.children) {
                          setOpenSubButtons(false);
                          dispatch(
                            setAmountReceivedFromPayer({
                              method: paymentButton.name,
                              amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
                            })
                          );
                        }
                      }}
                    >
                      {paymentButton.name}
                    </button>
                  </div>
                );
              })}
            </div>

            {openSubButtons && (
              <div className="mb-8 mt-4">
                {paymentButtons.find((paymentButton) => paymentButton.name === paymentMethodSet)?.children && (
                  <div>
                    <p>Choose payment network:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentButtons
                        .find((paymentButton) => paymentButton.name === paymentMethodSet)
                        ?.children?.map((childKey) => {
                          return (
                            <button
                              disabled={!payerAmountEntered || payerAmountEntered === "0"}
                              key={childKey.name}
                              style={{
                                color: payerAmountEntered && payerAmountEntered !== "0" ? childKey.color : "lightgray",
                                backgroundColor: payerAmountEntered && payerAmountEntered !== "0" ? childKey.bgColor : "gray",
                              }}
                              className={`px-2 py-1 font-semibold rounded focus:outline-none w-full text-center`}
                              onClick={() => {
                                dispatch(
                                  setAmountReceivedFromPayer({
                                    method:
                                      paymentButtons.find((paymentButton) => paymentButton.name === paymentMethodSet).name +
                                      " " +
                                      childKey.name,
                                    amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
                                  })
                                );
                              }}
                            >
                              {childKey.name}
                            </button>
                          );
                        })}
                    </div>
                    <div className="mt-2">
                      <label htmlFor="">Enter Mobile number</label>
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
                            cannotBeEmpty: (value) => (paymentMethodSet === "Mobile Money" && !value ? "Please enter mobile number" : ""),
                          },
                        })}
                        placeholder="eg. 0547748484"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
                      />
                      <p className="text-red-500 text-sm">{errors?.mobileMoneyNumber?.message}</p>
                    </div>
                  </div>
                )}
              </div>
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
            </div>

            <div className="w-full self-end mt-20">
              <button
                disabled={
                  !amountReceivedFromPayer ||
                  (paymentMethodSet === "Mobile Money" &&
                    (!watchMobileMoneyNumber || watchMobileMoneyNumber?.length !== lengthOfMobileNumber))
                }
                className={`${
                  !amountReceivedFromPayer ||
                  (paymentMethodSet === "Mobile Money" &&
                    (!watchMobileMoneyNumber || watchMobileMoneyNumber?.length !== lengthOfMobileNumber))
                    ? "bg-gray-400 text-gray-300"
                    : "bg-green-700 text-white"
                } px-6 py-4 font-semibold rounded focus:outline-none w-full text-center`}
                onClick={() => {
                  setStep(1);
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
              <p>
                <span>Instructions: </span>
                <span>Check phone to complete</span>
              </p>
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
                  dispatch(onResetCart());
                  dispatch(onClickToCheckout());
                }}
              >
                Return to Sell
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessSale;

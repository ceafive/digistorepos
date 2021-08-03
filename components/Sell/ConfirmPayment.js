import axios from "axios";
import Spinner from "components/Spinner";
import { onClickToCheckout, onResetCart, setVerifyTransactionResponse } from "features/cart/cartSlice";
import { setProductsOnHold } from "features/products/productsSlice";
import { throttle, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const ConfirmPayment = ({
  setStep,
  fetching,
  setFetching,
  confirmPaymentText,
  processError,
  setProcessError,
  confirmButtonText,
  userDetails,
  setConfirmButtonText,
}) => {
  const dispatch = useDispatch();
  const invoiceDetails = useSelector((state) => state.cart.invoiceDetails);

  const [ticking, setTicking] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  React.useEffect(() => {
    const verifyTransaction = async () => {
      try {
        setFetching(true);
        const getResData = async () => {
          const res = await axios.post("/api/sell/sell/verify-transaction", { user: userDetails, trxID: invoiceDetails?.invoice });
          const data = await res.data;
          return data;
        };

        await sleep(5000);
        const data = await getResData();
        // console.log(data);
        dispatch(setVerifyTransactionResponse(data));
        const { message } = data; // new, awaiting_payment, paid, cancelled, failed, expired   ie message values

        if (message === "new" || message === "awaiting_payment") {
          // console.log("hit 1");
          setLoading(true);
        } else {
          if (message === "paid") {
            // console.log("hit 2");
            setFetching(false);
            setLoading(false);
            setStep(2);
            // await throttledFn.cancel();
          } else if (message === "cancelled" || message === "failed" || message === "new" || message === "expired") {
            // console.log("hit 3");
            setLoading(false);
            setFetching(false);
            // await throttledFn.cancel();
            setConfirmButtonText("Start New Sale");
            setProcessError(`${upperCase(message)} TRANSACTION`);
          }
        }

        setLoading(false);
      } catch (error) {
        console.log(error.response);
      }
    };

    if (ticking) {
      const throttledFn = throttle(verifyTransaction, 10000, { trailing: false })();
      // !loading &&
      //   verifyTransactionResponse &&
      //   (verifyTransactionResponse?.message !== "new" || verifyTransactionResponse?.message !== "awaiting_payment") &&
      //   throttledFn.cancel();
    }
  }, [loading, ticking]);

  // React.useEffect(() => {
  //   console.log("hit here", verifyTransactionResponse);
  //   console.log("effecting 1", isAfter);
  //   if (isAfter) {
  //     console.log("effecting 2", isAfter);
  //     clearInterval(interval);
  //   }
  //   if (verifyTransactionResponse?.message === "paid") {
  //     setStep(2);
  //   } else if (
  //     verifyTransactionResponse?.message === "cancelled " ||
  //     verifyTransactionResponse?.message === "failed" ||
  //     verifyTransactionResponse?.message === "expired"
  //   ) {
  //     setConfirmButtonText("Start New Sale");
  //     setProcessError(`${upperCase(verifyTransactionResponse?.message)} TRANSACTION`);
  //   }
  // }, [interval, isAfter, setConfirmButtonText, setProcessError, setStep, verifyTransactionResponse, verifyTransactionResponse?.message]);

  return (
    <>
      {/* <p className="text-right mt-4 mb-4 ">
          <button
            className="font-bold text-lg focus:outline-none"
            onClick={() => {
              console.log("parked", cart);
              localStorage.setItem(
                "IPAYPARKSALE",
                JSON.stringify({
                  parkID: uniqueId(),
                  ...cart,
                })
              );
              dispatch(onClickToCheckout(false));
              dispatch(onResetCart());
            }}
          >
            <i className="fas fa-history mr-2"></i>
            <span>Park Sale</span>
          </button>
        </p> */}
      <div className="py-20 text-center">
        {processError ? (
          <p className={`font-bold text-4xl ${processError.includes("PAID") ? "text-green-500" : "text-red-500 "}`}>{processError}</p>
        ) : (
          <div>
            <p className="font-bold text-4xl">Awaiting Payment</p>
            <div className="mt-4">
              <p>
                <span className="font-bold">Instructions: </span>
                <span dangerouslySetInnerHTML={{ __html: confirmPaymentText }} />
              </p>
            </div>
          </div>
        )}

        <div className="w-full self-end mt-20">
          <button
            disabled={fetching}
            className={`${
              fetching ? "bg-gray-400 text-gray-300" : "bg-green-700 text-white"
            } px-6 py-4 font-semibold rounded focus:outline-none w-full text-center`}
            onClick={() => {
              confirmButtonText
                ? (() => {
                    dispatch(onClickToCheckout(false));
                    dispatch(onResetCart());
                    dispatch(setProductsOnHold());
                  })()
                : setTicking(true);
            }}
          >
            {fetching && (
              <div className="inline-block mr-2">
                <Spinner type={"TailSpin"} color="green" width={20} height={20} timeout={3000000} />
              </div>
            )}
            {confirmButtonText ? confirmButtonText : "Confirm Payment"}
          </button>
          {/* {processError && <p className="text-center text-red-500 text-sm">{processError}</p>} */}
        </div>
      </div>
    </>
  );
};

export default ConfirmPayment;

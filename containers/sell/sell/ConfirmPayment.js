import axios from "axios";
import Spinner from "components/Spinner";
import { onClickToCheckout, onResetCart, setOutletSelected, setRewardPoints, setVerifyTransactionResponse } from "features/cart/cartSlice";
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
  setReFetch,
}) => {
  const dispatch = useDispatch();
  const invoiceDetails = useSelector((state) => state.cart.invoiceDetails);

  const [ticking, setTicking] = React.useState(false);

  const statusCheckTotalRunTime = 30000;

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  React.useEffect(() => {
    const verifyTransaction = async (firstTimeStarted, interval) => {
      try {
        setFetching(true);
        const getResData = async () => {
          const res = await axios.post("/api/sell/sell/verify-transaction", { user: userDetails, trxID: invoiceDetails?.invoice });
          const data = await res.data;
          return data;
        };

        // await sleep(5000);
        const data = await getResData();
        // console.log(data);
        dispatch(setVerifyTransactionResponse(data));
        const { message } = data; // new, awaiting_payment, paid, cancelled, failed, expired   ie message values
        // console.log(message);

        if (message === "new" || message === "awaiting_payment") {
          if (Date.now() - firstTimeStarted > statusCheckTotalRunTime) {
            setConfirmButtonText("Start New Sale");
            setProcessError(
              "Sorry, Payment for your Delivery request is pending confirmation. <br>You will be notified via Email/SMS once your payment is confirmed.<br>And your request will be processed."
            );
            setFetching(false);
            setTicking(false);
            clearInterval(interval);
          }
        } else {
          if (message === "paid") {
            dispatch(
              setRewardPoints({
                reward_message: data?.reward_message,
                reward_points_earned: data?.reward_points_earned,
                reward_total_points: data?.reward_total_points,
              })
            );
            setFetching(false);
            setStep(2);
            setTicking(false);
            clearInterval(interval);
          } else if (message === "cancelled" || message === "failed" || message === "new" || message === "expired") {
            setFetching(false);
            setConfirmButtonText("Start New Sale");
            setProcessError(`${upperCase(message)} TRANSACTION`);
            setTicking(false);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.log(error.response);
      }
    };

    // if (ticking) {
    //   const throttledFn = throttle(verifyTransaction, 10000, { trailing: false })();
    //   // !loading &&
    //   //   verifyTransactionResponse &&
    //   //   (verifyTransactionResponse?.message !== "new" || verifyTransactionResponse?.message !== "awaiting_payment") &&
    //   //   throttledFn.cancel();
    // }

    // I want to call a Javascript function x times for y seconds
    if (ticking) {
      setFetching(true);
      var started = Date.now();
      var interval = setInterval(() => {
        verifyTransaction(started, interval);
      }, 10000); // every 10 seconds
    }
  }, [ticking]);

  return (
    <>
      {/* <p className="mt-4 mb-4 text-right ">
          <button
            className="text-lg font-bold focus:outline-none"
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
            <i className="mr-2 fas fa-history"></i>
            <span>Park Sale</span>
          </button>
        </p> */}

      <div className="py-20 text-center">
        {processError ? (
          <p
            dangerouslySetInnerHTML={{ __html: processError }}
            className={`text-center font-bold text-2xl  ${
              processError.includes("FAILED") || processError.includes("Sorry") ? `text-red-500` : `text-green-500`
            } `}
          />
        ) : (
          <div>
            <p className="text-4xl font-bold">Awaiting Payment</p>
            <div className="mt-4">
              <p>
                <span className="font-bold">Instructions: </span>
                <span dangerouslySetInnerHTML={{ __html: confirmPaymentText }} />
              </p>
            </div>
          </div>
        )}

        <div className="self-end w-full mt-20">
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
                    dispatch(setOutletSelected(null));
                    setReFetch(new Date());
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
          {/* {processError && <p className="text-sm text-center text-red-500">{processError}</p>} */}
        </div>
      </div>
    </>
  );
};

export default ConfirmPayment;

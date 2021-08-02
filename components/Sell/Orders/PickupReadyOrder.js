import axios from "axios";
import Spinner from "components/Spinner";
import React from "react";
import { useToasts } from "react-toast-notifications";
import { sentryErrorLogger } from "utils";

const PickuReadyOrder = ({ user, order, fetching, setFetching, onClose }) => {
  const { addToast } = useToasts();
  const [fetchingData, setFetchingData] = React.useState(false);
  const [merchantDeliveryConfig, setMerchantDeliveryConfig] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      if (order?.delivery_type === "DELIVERY") {
        setFetchingData(true);
        const processRes = await axios.post("/api/sell/sell/get-delivery-type", {
          user,
        });
        const { data, status: resStatus } = await processRes?.data;
        //   console.log(processRes);
        setFetchingData(false);
        if (Number(resStatus) === 0) setMerchantDeliveryConfig(data);
      }
    })();
  }, []);

  const updateDeliveryStatus = async (status) => {
    try {
      setFetching(true);
      const data = {
        no: order?.order_no,
        status,
        status_by: "MERCHANT",
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      console.log(data);

      const processRes = await axios.post("/api/sell/orders/update-delivery-status", data);
      const { message, status: resStatus } = await processRes?.data;
      console.log(processRes);
      addToast(message, { appearance: Number(resStatus) === 0 ? "success" : "error", autoDismiss: true });
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
      onClose();
    }
  };

  if (fetchingData) {
    return (
      <div
        className="flex justify-center items-center h-full min-w-screen"
        style={{
          height: 300,
        }}
      >
        <Spinner type="TailSpin" width={30} height={30} />
      </div>
    );
  }

  return (
    <div className="w-full p-10 pt-3 pb-5">
      <h1>Order Actions</h1>
      <div className="flex w-full justify-center mt-3">
        {order?.delivery_type !== "DELIVERY" &&
          ["YES"].includes(merchantDeliveryConfig?.option_closure) &&
          !["CANCELLED','DELIVERED"].includes(order?.delivery_status) && (
            <button
              disabled={fetching}
              className={`${fetching ? `bg-gray-200` : `bg-green-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
              onClick={() => {
                updateDeliveryStatus(`DELIVERED`);
              }}
            >
              Close Order as delivered
            </button>
          )}

        {order?.delivery_type === "DELIVERY" &&
          ["MERCHANT", "MERCHANT-DIST"].includes(merchantDeliveryConfig?.option_delivery) &&
          ["YES"].includes(merchantDeliveryConfig?.option_closure) &&
          !["CANCELLED','DELIVERED"].includes(order?.delivery_status) && (
            <button
              disabled={fetching}
              className={`${fetching ? `bg-gray-200` : `bg-green-500`} text-lg px-6 py-4 text-white font-bold shadow`}
              onClick={() => {
                updateDeliveryStatus(`DELIVERED`);
              }}
            >
              Close Order as delivered
            </button>
          )}
      </div>
    </div>
  );
};

export default PickuReadyOrder;

import axios from "axios";
import Spinner from "components/Spinner";
import React from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { sentryErrorLogger } from "utils";

const ReAssignOrder = ({ user, order, fetching, setFetching, onClose }) => {
  const { addToast } = useToasts();
  const outlets = useSelector((state) => state.products.outlets);

  const assignOrderToOutlet = async (id) => {
    try {
      const data = {
        no: order?.order_no,
        outlet: id,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      //   console.log(data);

      setFetching(true);
      const processRes = await axios.post("/api/sell/orders/assign-order-to-outlet", data);
      const { message, status: resStatus } = await processRes?.data;
      addToast(message, { appearance: Number(resStatus) === 0 ? "success" : "error", autoDismiss: true });
    } catch (error) {
      console.log(error);
      sentryErrorLogger(error);
    } finally {
      setFetching(false);
      onClose();
    }
  };

  return (
    <div className="mt-1 mb-4">
      <h1>Select New Outlet To Assign To</h1>
      <div className="flex w-full justify-center mt-4">
        {outlets?.map((outlet) => {
          return (
            <button
              key={outlet?.outlet_id}
              disabled={fetching}
              className={`${fetching ? `bg-gray-200` : `bg-green-500`} text-lg px-4 py-2 text-white mr-5 font-bold shadow`}
              onClick={() => {
                assignOrderToOutlet(outlet?.outlet_id);
              }}
            >
              {outlet?.outlet_name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AcceptedOrder = ({ user, order, fetching, setFetching, onClose }) => {
  const { addToast } = useToasts();
  const outlets = useSelector((state) => state.products.outlets);

  const [openAssignOrderBox, setOpenAssignOrderBox] = React.useState(false);
  const [merchantDeliveryConfig, setMerchantDeliveryConfig] = React.useState(null);
  const [fetchingData, setFetchingData] = React.useState(false);

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

  const processOrder = async (status) => {
    try {
      setFetching(true);
      const data = {
        no: order?.order_no,
        status,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      console.log(data);

      const processRes = await axios.post("/api/sell/orders/process-order", data);
      const { message, status: resStatus } = await processRes?.data;
      console.log(processRes);
      addToast(message, { appearance: Number(resStatus) === 0 ? "success" : "error", autoDismiss: true });
    } catch (error) {
      console.log(error);
      sentryErrorLogger(error);
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

  if (openAssignOrderBox) {
    return <ReAssignOrder order={order} user={user} fetching={fetching} setFetching={setFetching} onClose={onClose} />;
  }

  return (
    <div className="w-full p-10 pt-3 pb-5">
      <h1>Order Actions</h1>
      <div className="flex w-full justify-center mt-3">
        {outlets?.length > 1 &&
          order?.delivery_type === "DELIVERY" &&
          ["MERCHANT", "MERCHANT-DIST"].includes(merchantDeliveryConfig?.option_delivery) &&
          ["PENDING"].includes(order?.delivery_status) && (
            <button
              disabled={fetching}
              className={`${fetching ? `bg-gray-200` : `bg-green-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
              onClick={() => {
                setOpenAssignOrderBox(true);
              }}
            >
              Re-assign Delivery Shop
            </button>
          )}
        <button
          disabled={fetching}
          className={`${fetching ? `bg-gray-200` : `bg-red-500`} text-lg px-6 py-4 text-white font-bold shadow`}
          onClick={() => {
            processOrder(`DECLINED`);
          }}
        >
          Decline Order
        </button>
      </div>
    </div>
  );
};

export default AcceptedOrder;

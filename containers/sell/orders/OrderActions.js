import axios from "axios";
import Spinner from "components/Spinner";
import React from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { sentryErrorLogger } from "utils";

import AcceptedOrder from "./AcceptedOrder";
import PaidOrder from "./PaidOrder";
import PickupReadyOrder from "./PickupReadyOrder";

const NewOrder = ({ user, order, fetching, setFetching, onClose }) => {
  const { addToast } = useToasts();
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
    } finally {
      setFetching(false);
      onClose();
    }
  };

  return (
    <div className="w-full p-10 py-5">
      <h1>Order Actions</h1>
      <div className="flex w-full justify-center mt-4">
        <button
          disabled={fetching}
          className={`${fetching ? `bg-gray-200` : `bg-green-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
          onClick={() => {
            processOrder(`ACCEPTED`);
          }}
        >
          Accept Order
        </button>
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

const OrderActions = ({ order, user, onClose }) => {
  //   console.log(order);
  const [fetching, setFetching] = React.useState(false);

  if (order?.order_status === "NEW") {
    return <NewOrder user={user} order={order} setFetching={setFetching} fetching={fetching} onClose={onClose} />;
  }

  if (order?.order_status === "ACCEPTED") {
    return <AcceptedOrder user={user} order={order} setFetching={setFetching} fetching={fetching} onClose={onClose} />;
  }

  if (order?.order_status === "PAID") {
    return <PaidOrder user={user} order={order} setFetching={setFetching} fetching={fetching} onClose={onClose} />;
  }

  if (order?.order_status === "PICKUP_READY") {
    return <PickupReadyOrder user={user} order={order} setFetching={setFetching} fetching={fetching} onClose={onClose} />;
  }

  return <div>Order Actions</div>;
};

export default OrderActions;

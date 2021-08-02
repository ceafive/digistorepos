import axios from "axios";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import React from "react";
import { paymentOptionNames, paymentOptions } from "utils";

const OrderDetailsComponent = ({ order, user }) => {
  const [orderDetails, setOrderDetails] = React.useState(null);
  const [fetching, setFetching] = React.useState(false);

  // console.log(order);
  // console.log(orderDetails);

  /**
   * @return one of 'NEW','CANCELLED','PICK UP READY','DELIVERED'
   */
  const statusColors = {
    NEW: {
      bg: `gray-200`,
      text: `black`,
      message: `NEW`,
    },
    CANCELLED: {
      bg: `red-400`,
      text: `white`,
      message: `CANCELLED`,
    },
    DELIVERED: {
      bg: `green-600`,
      text: `white`,
      message: `DELIVERED`,
    },
    "PICK UP READY": {
      bg: `green-500`,
      text: `white`,
      message: `PICK UP READY`,
    },
    PAID: {
      bg: `green-400`,
      text: `white`,
      message: `PAID`,
    },
  };

  React.useEffect(() => {
    (async () => {
      setFetching(true);
      const orderRes = await axios.post("/api/sell/orders/get-order-details", {
        merchant: user?.user_merchant_id,
        orderNo: order?.order_no,
      });
      const orderItemsRes = await axios.post("/api/sell/orders/get-order-items", {
        merchant: user?.user_merchant_id,
        orderNo: order?.order_no,
      });

      const { data: orderResData } = await orderRes.data;
      const { data: orderItemsResData } = await orderItemsRes.data;
      const merged = { ...orderResData, items: (orderItemsResData ?? []).filter((item) => Boolean(item)) };
      setOrderDetails(merged);
      // console.log(merged);

      setFetching(false);
    })();
  }, []);

  if (fetching || orderDetails === null) {
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
    <div className="w-full p-10 py-5">
      <div className="flex w-full justify-center items-center">
        <h1 className="font-bold text-xl">Order No: {orderDetails?.order_no}</h1>
        <p
          className={`bg-${statusColors[orderDetails?.order_status_desc]?.bg} text-${
            statusColors[orderDetails?.order_status_desc]?.text
          } ml-5 px-6 py-2 rounded-2xl font-semibold text-xs`}
        >
          {statusColors[orderDetails?.order_status_desc]?.message}
        </p>
      </div>

      <div className="flex flex-wrap w-full mt-4">
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Order Date</h1>
          <p>{format(new Date(orderDetails?.order_date ?? ""), "iii, d MMM yy h:mmaaa")}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Order Amount</h1>
          <p>GHS{orderDetails?.order_amount}</p>
        </div>

        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Order Status</h1>
          <p>{orderDetails?.order_status_desc}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Name</h1>
          <p>{orderDetails?.customer_name || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Email</h1>
          <p>{orderDetails?.customer_email || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Contact</h1>
          <p>{orderDetails?.customer_contact || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Payment Channel</h1>
          <p>{paymentOptionNames[orderDetails?.payment_channel] || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Payment Invoice Number</h1>
          <p>{orderDetails?.payment_invoice || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Created By</h1>
          <p>{orderDetails?.created_by_name}</p>
        </div>
      </div>

      <div className="flex flex-wrap w-full mt-4 justify-center">
        <h1 className="font-bold">Order Items</h1>
        {orderDetails?.items?.map((item, index) => {
          return (
            <div key={index} className="flex flex-wrap w-full my-2">
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Item Name</h1>
                <p>{item?.order_item}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Item Amount</h1>
                <p>GHS{item?.order_item_amount}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Item Quantity</h1>
                <p>{item?.order_item_qty || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Item Unit Cost</h1>
                <p>GHS{item?.order_item_unit_cost || "N/A"}</p>
              </div>

              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Item Discount</h1>
                <p>GHS{item?.order_item_discount || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Item Variants</h1>
                <p>{item?.order_item_properties || "N/A"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default OrderDetailsComponent;

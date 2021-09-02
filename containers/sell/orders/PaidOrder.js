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

const AssignOrderToRider = ({ order, user, onClose, fetching, setFetching, setReRun }) => {
  const [riders, setRiders] = React.useState(null);
  const [fetchingData, setFetchingData] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setFetchingData(true);
      const merchantRidersRes = await axios.post("/api/sell/orders/get-delivery-riders", {
        merchant: user?.user_merchant_id,
      });

      const { data: merchantRidersResData } = await merchantRidersRes.data;
      setRiders(merchantRidersResData?.filter(Boolean));

      setFetchingData(false);
    })();
  }, []);

  const assignRider = async (id) => {
    try {
      setProcessing(true);
      const data = {
        no: order?.order_no,
        rider: id,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };
      const assignRiderRes = await axios.post("/api/sell/orders/assign-rider", data);
      const { data: assignRiderResData } = await assignRiderRes.data;
      console.log(assignRiderResData);
    } catch (error) {
      console.log(error);
      sentryErrorLogger(error);
    } finally {
      onClose();
      setProcessing(false);
      // setReRun(new Date());
    }
  };

  if (fetchingData || riders === null) {
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
        <h1 className="font-bold text-xl">Assign Rider to order</h1>
        {/* <h1 className="font-bold text-xl">No. of Riders: {riders?.length}</h1> */}
      </div>

      <div className="w-full mt-4">
        <div className="flex items-center w-full my-2">
          <h1 className="font-bold w-1/3">No.</h1>
          <h1 className="font-bold w-1/3">Rider Name</h1>
          <h1 className="font-bold w-1/3">Action</h1>
        </div>
        {riders.map((rider, index) => {
          return (
            <div key={rider?.rider_id} className="flex items-center w-full my-2">
              <h1 className="font-bold w-1/3">{index + 1}.</h1>
              <h1 className="font-bold w-1/3">{rider?.rider_name}</h1>
              <button
                onClick={() => {
                  assignRider(rider?.rider_id);
                }}
                disabled={processing}
                className={`font-bold ${processing ? "bg-gray-200" : "bg-green-600"} text-white rounded outline-none px-6 py-2 w-1/3`}
              >
                Assign Rider
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PaidOrder = ({ user, order, fetching, setFetching, onClose }) => {
  const { addToast } = useToasts();
  const outlets = useSelector((state) => state.products.outlets);
  const [openAssignRiderBox, setOpenAssignRiderBox] = React.useState(false);
  const [fetchingData, setFetchingData] = React.useState(false);
  const [openAssignOrderBox, setOpenAssignOrderBox] = React.useState(false);
  const [merchantDeliveryConfig, setMerchantDeliveryConfig] = React.useState(null);

  // console.log(merchantDeliveryConfig);

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
    } finally {
      setFetching(false);
      onClose();
    }
  };

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

  if (openAssignOrderBox) {
    return <ReAssignOrder order={order} user={user} fetching={fetching} setFetching={setFetching} onClose={onClose} />;
  }

  if (openAssignRiderBox) {
    return <AssignOrderToRider order={order} user={user} fetching={fetching} setFetching={setFetching} onClose={onClose} />;
  }

  //   console.log(
  //     order?.delivery_type,
  //     ["MERCHANT", "MERCHANT-DIST"].includes(merchantDeliveryConfig?.option_delivery),
  //     order?.delivery_outlet,
  //     ["PENDING"].includes(order?.delivery_status)
  //   );

  return (
    <div className="w-full p-10 pt-3 pb-5">
      <h1>Order Actions</h1>
      <div className="flex w-full justify-center mt-3">
        {order?.delivery_type !== "DELIVERY" && (
          <button
            disabled={fetching}
            className={`${fetching ? `bg-gray-200` : `bg-orange-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
            onClick={() => {
              processOrder(`PICKUP_READY`);
            }}
          >
            Ready for pick-up
          </button>
        )}

        {order?.delivery_type === "DELIVERY" &&
          ["MERCHANT", "MERCHANT-DIST"].includes(merchantDeliveryConfig?.option_delivery) &&
          !!order?.delivery_outlet &&
          ["PENDING"].includes(order?.delivery_status) && (
            <button
              disabled={fetching}
              className={`${fetching ? `bg-gray-200` : `bg-blue-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
              onClick={() => {
                setOpenAssignRiderBox(true);
              }}
            >
              Assign Rider
            </button>
          )}

        {order?.delivery_type === "DELIVERY" && !!order?.delivery_rider && ["PENDING"].includes(order?.delivery_status) && (
          <button
            disabled={fetching}
            className={`${fetching ? `bg-gray-200` : `bg-orange-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
            onClick={() => {
              processOrder(`PICKUP_READY`);
            }}
          >
            Ready for pick-up
          </button>
        )}

        {outlets?.length > 1 &&
          order?.delivery_type === "DELIVERY" &&
          ["MERCHANT", "MERCHANT-DIST"].includes(merchantDeliveryConfig?.option_delivery) &&
          ["PENDING"].includes(order?.delivery_status) && (
            <button
              disabled={fetching}
              className={`${fetching ? `bg-gray-200` : `bg-purple-500`} text-lg px-6 py-4 text-white mr-5 font-bold shadow`}
              onClick={() => {
                setOpenAssignOrderBox(true);
              }}
            >
              Re-assign Delivery Shop
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

export default PaidOrder;

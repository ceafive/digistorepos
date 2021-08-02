import axios from "axios";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import React from "react";
import { sentryErrorLogger } from "utils";

const AssignOrderToRider = ({ order, user, onClose, setReRun }) => {
  const [riders, setRiders] = React.useState(null);
  const [fetching, setFetching] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const statusColors = {
    PAYMENT_FAILED: {
      bg: `red-400`,
      text: `white`,
      message: `PAYMENT FAILED`,
    },
    COMPLETED: {
      bg: `green-600`,
      text: `white`,
      message: `COMPLETED`,
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
      const merchantRidersRes = await axios.post("/api/sell/orders/get-delivery-riders", {
        merchant: user?.user_merchant_id,
      });

      const { data: merchantRidersResData } = await merchantRidersRes.data;
      setRiders(merchantRidersResData?.filter(Boolean));

      setFetching(false);
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
      setReRun(new Date());
    }
  };

  if (fetching || riders === null) {
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
        <h1 className="font-bold text-xl">No. of Riders: {riders?.length}</h1>
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
export default AssignOrderToRider;

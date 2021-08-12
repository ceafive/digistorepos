import axios from "axios";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import React from "react";
import { sentryErrorLogger } from "utils";

const CustomerDetails = ({ customer, user, onClose }) => {
  const [customerDetails, setCustomerDetails] = React.useState(null);
  const [fetching, setFetching] = React.useState(true);
  //   const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const customerDetailsRes = await axios.post("/api/customers/get-customer-details", {
          merchant: user?.user_merchant_id,
          customer_id: customer?.customer_id,
        });

        const { data: customerDetailsResData } = await customerDetailsRes.data;
        setCustomerDetails(customerDetailsResData);
        setFetching(false);
      } catch (error) {
        sentryErrorLogger(error);
      }
    })();
  }, []);

  if (fetching) {
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

  if (!fetching || customerDetails === null) {
    return (
      <div
        className="flex justify-center items-center h-full min-w-screen"
        style={{
          height: 300,
        }}
      >
        <h1>No Customer Details</h1>
      </div>
    );
  }

  return (
    <div className="w-full p-10 py-5">
      <div className="flex w-full justify-center items-center">
        <h1 className="font-bold text-xl">Details for: {customerDetails?.customer_name}</h1>
      </div>

      <div className="flex flex-wrap w-full mt-4">
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer ID</h1>
          <p>{customerDetails?.customer_id}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Name</h1>
          <p>{customerDetails?.customer_name}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Email</h1>
          <p>{customerDetails?.customer_email}</p>
        </div>

        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Phone Number</h1>
          <p>{customerDetails?.customer_phone}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Alt Phone</h1>
          <p>{customerDetails?.customer_alt_phone || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Date Of Birth</h1>
          <p>{customerDetails?.customer_dob || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Status</h1>
          <p>{customerDetails?.customer_status || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Total Order Count</h1>
          <p>{customerDetails?.total_counts || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Total Loyalty Points</h1>
          <p>{customerDetails?.total_loyalty_points || "N/A"}</p>
        </div>
        <div className="w-1/4 mb-2">
          <h1 className="font-bold">Customer Total Spend</h1>
          <p>{customerDetails?.total_spends || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;

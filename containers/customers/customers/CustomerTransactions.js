import axios from "axios";
import Spinner from "components/Spinner";
import { format, startOfMonth } from "date-fns";
import { filter } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { sentryErrorLogger } from "utils";

import DateRangerSelector from "./DateRangerSelector";

const CustomerTransactions = ({ customer, user, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();
  const [transactions, setTransactions] = React.useState(null);
  const [fetching, setFetching] = React.useState(true);
  //   const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const formCurrentValues = getValues();
        const transactionsRes = await axios.post("/api/customers/get-customer-transactions", {
          merchant: user?.user_merchant_id,
          customer_phone: customer?.customer_phone,
          start_date: format(formCurrentValues?.startDate || startOfMonth(new Date()), "dd-MM-yyyy"),
          end_date: format(formCurrentValues?.endDate || new Date(), "dd-MM-yyyy"),
        });

        const { data: transactionsResData } = await transactionsRes.data;
        // console.log(transactionsResData);
        setTransactions(filter(transactionsResData, Boolean));
        setFetching(false);
      } catch (error) {
        sentryErrorLogger(error);
      }
    })();
  }, []);

  const handleSubmitQuery = async (values) => {
    try {
      setFetching(true);
      const transactionsRes = await axios.post("/api/customers/get-customer-transactions", {
        merchant: user?.user_merchant_id,
        customer_phone: customer?.customer_phone,
        start_date: format(values?.startDate, "dd-MM-yyyy"),
        end_date: format(values?.endDate, "dd-MM-yyyy"),
      });

      const { data: transactionsResData } = await transactionsRes.data;
      // console.log(transactionsResData);
      setTransactions(filter(transactionsResData, Boolean));
      setFetching(false);
    } catch (error) {
      sentryErrorLogger(error);
    } finally {
      setFetching(false);
    }
  };

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

  if (!fetching && (transactions === null || transactions?.length === 0)) {
    return (
      <div
        className="flex justify-center items-center h-full min-w-screen"
        style={{
          height: 300,
        }}
      >
        <h1>No Transaction Details</h1>
      </div>
    );
  }

  return (
    <div className="w-full p-10 py-5 pt-0">
      <div className="flex w-full justify-center items-center mb-2">
        <h1 className="font-bold text-xl">Transactions</h1>
      </div>

      <DateRangerSelector register={register} fetching={fetching} errors={errors} handleSubmit={handleSubmit} handleSubmitQuery={handleSubmitQuery} />

      {transactions.map((transactionDetail) => {
        return (
          <div key={transactionDetail?.PAYMENT_REFERENCE}>
            <div key={transactionDetail?.PAYMENT_REFERENCE} className="flex flex-wrap w-full mb-6">
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Customer Name</h1>
                <p>{transactionDetail?.CUSTOMER_NAME || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Customer Email</h1>
                <p>{transactionDetail?.CUSTOMER_EMAIL || "N/A"}</p>
              </div>

              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Customer Phone Number</h1>
                <p>{transactionDetail?.CUSTOMER_CONTACTNO}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Amount</h1>
                <p>{transactionDetail?.PAYMENT_AMOUNT || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Payment Channel</h1>
                <p>{transactionDetail?.PAYMENT_CHANNEL || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Description</h1>
                <p>{transactionDetail?.PAYMENT_DESCRIPTION || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Invoice Number</h1>
                <p>{transactionDetail?.PAYMENT_INVOICE || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Reference</h1>
                <p>{transactionDetail?.PAYMENT_REFERENCE || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Type</h1>
                <p>{transactionDetail?.PAYMENT_TYPE || "N/A"}</p>
              </div>
              <div className="w-1/4 mb-2">
                <h1 className="font-bold">Transaction Payment Date</h1>
                {/* <p>{transactionDetail?.TRANSACTION_DATE || "N/A"}</p> */}
                <p>{format(new Date(transactionDetail?.TRANSACTION_DATE ?? ""), "iii, d MMM yy h:mmaaa")}</p>
              </div>
            </div>
            <div className="h-1 bg-gray-300"></div>
          </div>
        );
      })}
    </div>
  );
};
export default CustomerTransactions;

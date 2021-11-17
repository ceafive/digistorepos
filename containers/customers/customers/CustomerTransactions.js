import axios from "axios";
import PatchedPagination from "components/Misc/PatchedPagination";
import { tableIcons } from "components/Misc/TableIcons";
import Spinner from "components/Spinner";
import { format, startOfMonth } from "date-fns";
import { filter } from "lodash";
import MaterialTable, { MTableToolbar } from "material-table";
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

        const data = {
          merchant: user?.user_merchant_id,
          customer_phone: customer?.customer_phone,
          start_date: format(formCurrentValues?.startDate || startOfMonth(new Date()), "dd-MM-yyyy"),
          end_date: format(formCurrentValues?.endDate || new Date(), "dd-MM-yyyy"),
        };

        // console.log(data);

        const transactionsRes = await axios.post("/api/customers/get-customer-transactions", data);

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

  const columns = [
    { title: "Contact Number", field: "CUSTOMER_CONTACTNO" },
    {
      title: "Email",
      field: "CUSTOMER_EMAIL",
    },
    {
      title: "Customer Name",
      field: "CUSTOMER_NAME",
    },
    {
      title: "Payment Amount",
      field: "PAYMENT_AMOUNT",
    },
    {
      title: "Payment Channel",
      field: "PAYMENT_CHANNEL",
    },
    {
      title: "Payment Description",
      field: "PAYMENT_DESCRIPTION",
      cellStyle() {
        return {
          width: "100%",
          minWidth: 200,
        };
      },
    },
    { title: "Payment Invoice", field: "PAYMENT_INVOICE" },
    { title: "Payment Reference", field: "PAYMENT_REFERENCE" },
    { title: "Payment Type", field: "PAYMENT_TYPE" },
    {
      title: "Transaction Date",
      field: "TRANSACTION_DATE",
      render(rowData) {
        return (
          <div>
            <p>{format(new Date(rowData?.TRANSACTION_DATE ?? ""), "iii, d MMM yy h:mmaaa")}</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full p-10 py-5">
      <div className="flex w-full justify-center items-center mb-2">
        <h1 className="font-bold text-xl">Transactions</h1>
      </div>

      <DateRangerSelector register={register} fetching={fetching} errors={errors} handleSubmit={handleSubmit} handleSubmitQuery={handleSubmitQuery} />

      {fetching ? (
        <div
          className="flex justify-center items-center h-full min-w-screen"
          style={{
            height: 300,
          }}
        >
          <Spinner type="TailSpin" width={30} height={30} />
        </div>
      ) : !fetching && (transactions === null || transactions?.length === 0) ? (
        <div
          className="flex justify-center items-center h-full min-w-screen"
          style={{
            height: 300,
          }}
        >
          <h1>No Transaction Details</h1>
        </div>
      ) : (
        <div>
          <MaterialTable
            isLoading={fetching}
            title={
              <p>
                <span className="font-bold text-xl">Transactions</span>{" "}
                <span>{`${getValues()?.startDate?.toDateString() || ""} - ${getValues()?.endDate?.toDateString() || ""}`}</span>
              </p>
            }
            icons={tableIcons}
            columns={columns}
            data={transactions?.map((o) => ({ ...o, tableData: {} }))}
            options={{
              selection: false,
              pageSize: 3,
              pageSizeOptions: [3],
              padding: "dense",
            }}
            components={{
              Toolbar: function Toolbar(props) {
                return (
                  <div>
                    <MTableToolbar {...props} />
                  </div>
                );
              },
              Pagination: PatchedPagination,
            }}
            //   onRowClick={(event, rowData, togglePanel) => togglePanel()}
          />
        </div>
      )}

      {/* {transactions.map((transactionDetail) => {
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
                <p>{format(new Date(transactionDetail?.TRANSACTION_DATE ?? ""), "iii, d MMM yy h:mmaaa")}</p>
              </div>
            </div>
            <div className="h-1 bg-gray-300"></div>
          </div>
        );
      })} */}
    </div>
  );
};
export default CustomerTransactions;

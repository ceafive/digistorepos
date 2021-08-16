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

const CustomerOrdersDetails = ({ customer, user, onClose }) => {
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
        const transactionsRes = await axios.post("/api/customers/get-customer-orders-details", {
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
      const transactionsRes = await axios.post("/api/customers/get-customer-orders-details", {
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
    { title: "Order No", field: "order_no" },
    {
      title: "Order Status",
      field: "order_status",
    },
    {
      title: "Order Date",
      field: "order_date",
      render(rowData) {
        return (
          <div>
            <p>{format(new Date(rowData?.order_date ?? ""), "iii, d MMM yy h:mmaaa")}</p>
          </div>
        );
      },
      cellStyle() {
        return {
          width: "100%",
          minWidth: 200,
        };
      },
      // defaultSort: "desc",
    },
    {
      title: "Order Items",
      field: "order_items",
      render(rowData) {
        return (
          <div>
            {rowData?.order_items?.map((item, index) => {
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
                </div>
              );
            })}
          </div>
        );
      },
      cellStyle(data) {
        return {
          width: "100%",
          minWidth: 500,
        };
      },
      // defaultSort: "desc",
    },
    {
      title: "Order Amount",
      field: "order_amount",
      render(rowData) {
        return (
          <div>
            <p>{rowData?.order_amount || "N/A"}</p>
          </div>
        );
      },
    },
    {
      title: "Payment Invoice Number",
      field: "payment_invoice",
    },
    { title: "Delivery Type", field: "delivery_type" },
    { title: "Delivery Outlet", field: "delivery_outlet" },
    { title: "Delivery Status", field: "delivery_status" },
    { title: "Merchant Name", field: "merchant_name" },
  ];

  return (
    <div className="w-full p-10 px-5 py-5">
      <div className="flex w-full justify-center items-center mb-2">
        <h1 className="font-bold text-xl">Orders</h1>
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
                <span className="font-bold text-xl">Orders</span>{" "}
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

      {/* {transactions.map((orderDetails) => { 
        return (
          <div key={orderDetails?.order_no}>
            <div key={orderDetails?.order_no}>
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
                  <h1 className="font-bold">Order Description</h1>
                  <p>{orderDetails?.order_description}</p>
                </div>
                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Order Description</h1>
                  <p>{orderDetails?.order_source_desc}</p>
                </div>

                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Order Description</h1>
                  <p>{orderDetails?.order_status}</p>
                </div>

                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Order Description</h1>
                  <p>{orderDetails?.order_type}</p>
                </div>

                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Order Description</h1>
                  <p>{orderDetails?.delivery_type}</p>
                </div>

                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Order Description</h1>
                  <p>{orderDetails?.delivery_status}</p>
                </div>

                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Payment Invoice Number</h1>
                  <p>{orderDetails?.payment_invoice || "N/A"}</p>
                </div>
                <div className="w-1/4 mb-2">
                  <h1 className="font-bold">Customer Rating</h1>
                  <p>{orderDetails?.customer_rating || "N/A"}</p>
                </div>
              </div>

              {orderDetails?.order_items?.length > 0 && (
                <div className="flex flex-wrap w-full mt-4 justify-center">
                  <h1 className="font-bold">Order Items</h1>
                  {orderDetails?.order_items?.map((item, index) => {
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
                          <h1 className="font-bold">Item Variants</h1>
                          <p>{item?.order_item_properties || "N/A"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="h-1 bg-gray-300"></div>
          </div>
        );
      })} */}
    </div>
  );
};
export default CustomerOrdersDetails;

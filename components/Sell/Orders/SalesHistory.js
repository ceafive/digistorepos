/* eslint-disable react/display-name */
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import axios from "axios";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import { format, startOfMonth } from "date-fns";
import { setOrderHistory } from "features/orders/ordersSlice";
import { setAllOutlets } from "features/products/productsSlice";
import { filter, intersectionWith, map, upperCase } from "lodash";
import MaterialTable from "material-table";
import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import AssignOrderToRider from "./AssignOrderToRider";
import OrderActions from "./OrderActions";
import OrderDetailsComponent from "./OrderDetailsComponent";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const SalesHistory = () => {
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      // startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      // endDate: format(new Date(), "yyyy-MM-dd"),
      outletSelected: "All",
    },
  });
  const orderHistory = useSelector((state) => state.orders.orderHistory);
  const outlets = useSelector((state) => state.products.outlets);
  // console.log(orderHistory[0]);

  const [fetching, setFetching] = React.useState(false);
  const [outletsString, setOutletsString] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [order, setOrder] = React.useState(null);
  const [componentToRender, setComponentToRender] = React.useState("details");
  const [reRun, setReRun] = React.useState(new Date());
  const isAdmin = upperCase(user?.user_merchant_group) === "ADMINISTRATORS" ? true : false;

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        // dispatch(setAllOutlets([]));
        // dispatch(setOrderHistory([]));
        const formCurrentValues = getValues();
        // console.log(formCurrentValues);
        // TODO: Do not remove this object other methods in /api/orders/get-orders rely on it
        const data = {
          merchant: user?.user_merchant_id,
          outlet: formCurrentValues?.outletSelected,
          start_date: format(formCurrentValues?.startDate || startOfMonth(new Date()), "dd-MM-yyyy"),
          end_date: format(formCurrentValues?.endDate || new Date(), "dd-MM-yyyy"),
          isAdmin,
        };

        // console.log(data);

        const outletsRes = await axios.post("/api/sell/sell/get-outlets", { user });
        const { data: outletsResData = [] } = await outletsRes.data;
        // console.log(outletsResData);

        if (isAdmin) {
          dispatch(setAllOutlets(filter(outletsResData, (o) => Boolean(o))));
        } else {
          const response = intersectionWith(
            filter(outletsResData, (o) => Boolean(o)),
            user?.user_assigned_outlets ?? [],
            (arrVal, othVal) => {
              return arrVal.outlet_id === othVal;
            }
          );

          const outletsString = map(response ?? [], (o) => o?.outlet_id).join(",");
          setOutletsString(outletsString);

          const outletsStringToSend = formCurrentValues?.outletSelected === "All" ? outletsString : formCurrentValues?.outletSelected;
          data["outlet"] = outletsStringToSend;

          dispatch(setAllOutlets(filter(response, (o) => Boolean(o))));
        }

        const allOrdersRes = await axios.post("/api/sell/orders/get-orders", data);
        const { data: allOrdersResData } = await allOrdersRes.data;
        dispatch(setOrderHistory(filter(allOrdersResData, (o) => Boolean(o))));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch, reRun]);

  const columns = [
    {
      title: "Order No.",
      field: "order_no",
      render(rowData) {
        return (
          <div>
            <button className="text-blue-500">{rowData?.order_no}</button>
          </div>
        );
      },
      // disableClick: true,
    },
    {
      title: "Order Date",
      field: "order_date",
      render(rowData) {
        return <p>{format(new Date(rowData?.order_date), "iii, d MMM yy h:mmaaa")}</p>;
      },
      cellStyle: {
        width: "100%",
        minWidth: 200,
      },
    },
    {
      title: "Order Amount",
      field: "order_amount",
    },
    { title: "Discount", field: "order_discount" },
    {
      title: "Discount Coupon",
      field: "order_discount",
      render(rowData) {
        return <p>{rowData?.discount_coupon || "N/A"}</p>;
      },
    },
    {
      title: "Discount Type",
      field: "discount_type",
      render(rowData) {
        return <p>{rowData?.discount_type || "N/A"}</p>;
      },
    },
    { title: "Discount", field: "order_discount" },
    {
      title: "Order Items",
      field: "order_items",
    },
    {
      title: "Order Status",
      field: "order_status_desc",
    },
    {
      title: "Order Outlet",
      field: "delivery_outlet",
      cellStyle: {
        width: "100%",
        minWidth: 150,
      },
    },
    {
      title: "Order Source",
      field: "order_source_desc",
    },
    {
      title: "Order Notes",
      field: "customer_notes",
    },
    {
      title: "Order Invoice",
      field: "payment_invoice",
    },
    {
      title: "Delivery Type",
      field: "delivery_type",
    },
    {
      title: "Delivery Fee",
      field: "delivery_charge",
    },
    {
      title: "Delivery Location",
      field: "delivery_location",
      cellStyle: {
        width: "100%",
        minWidth: 250,
      },
      render(rowData) {
        return <p>{rowData?.delivery_location || "N/A"}</p>;
      },
    },
    {
      title: "Delivery Note",
      field: "delivery_notes",
      render(rowData) {
        return <p>{rowData?.delivery_notes || "N/A"}</p>;
      },
    },
    {
      title: "Delivery Rider",
      field: "delivery_rider",
      render(rowData) {
        return <p>{rowData?.delivery_type === "DELIVERY" ? rowData?.delivery_rider_name : "N/A"}</p>;
      },
    },
    {
      title: " Total Amount",
      field: "total_amount",
    },
    {
      title: "Customer Name",
      field: "customer_name",
    },
    {
      title: "Phone Number",
      field: "recipient_contact",
    },
    {
      title: "Created By",
      field: "created_by_name",
    },
    {
      title: "Actions",
      field: "actions",
      disableClick: true,
      render: (rowData) => {
        const icons = [
          {
            name: "tasks",
            action: () => {
              setOrder(rowData);
              setComponentToRender("order_actions");
              setOpenModal(true);
            },
          },
          // {
          //   name: "print",
          //   action: () => {},
          // },
          // {
          //   name: "motorcycle",
          //   action: () => {
          //     setComponentToRender("rider");
          //     setOrder(rowData?.order_no);
          //     setOpenModal(true);
          //   },
          // },
        ];
        return (
          <div className="flex items-center justify-between">
            {icons.map((icon) => {
              const disabled = !["NEW", "ACCEPTED", "PAID", "PICKUP_READY"].includes(rowData?.order_status);
              return (
                <button
                  disabled={disabled}
                  key={icon.name}
                  className={`text-2xl mx-3 ${disabled ? "text-gray-400" : "text-blue-500"}  outline-none`}
                  onClick={icon?.action}
                >
                  <i key={icon.name} className={`fas fa-${icon.name}`} />
                </button>
              );
            })}
          </div>
        );
      },
    },
  ];

  const handleSubmitQuery = async (values) => {
    try {
      setFetching(true);
      // console.log(values);
      const data = {
        merchant: user?.user_merchant_id,
        outlet: "",
        start_date: format(values?.startDate, "dd-MM-yyy"),
        end_date: format(values?.endDate, "dd-MM-yyyy"),
        isAdmin,
      };

      if (!isAdmin) {
        const stringedOutlets = map(
          intersectionWith(outlets, user?.user_assigned_outlets ?? [], (arrVal, othVal) => arrVal.outlet_id === othVal),
          (o) => o?.outlet_id
        ).join(",");

        const outletsStringToSend = values?.outletSelected === "All" ? outletsString : values?.outletSelected;
        data["outlet"] = outletsStringToSend;
      }

      // console.log(data);
      const allOrdersRes = await axios.post("/api/sell/orders/get-orders", data);
      const { data: allOrdersResData } = await allOrdersRes.data;
      dispatch(setOrderHistory(filter(allOrdersResData, (o) => Boolean(o))));
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      <Modal
        open={openModal}
        maxWidth="sm"
        onClose={() => {
          setOpenModal(false);
          // setReRun(new Date());
        }}
      >
        {componentToRender === "order_actions" && (
          <OrderActions
            isAdmin={isAdmin}
            order={order}
            user={user}
            onClose={() => {
              setOpenModal(false);
              setReRun(new Date());
            }}
          />
        )}

        {componentToRender === "details" && (
          <OrderDetailsComponent
            order={order}
            user={user}
            onClose={() => {
              setOpenModal(false);
              setReRun(new Date());
            }}
          />
        )}

        {componentToRender === "rider" && (
          <AssignOrderToRider
            order={order}
            user={user}
            onClose={() => {
              setOpenModal(false);
              setReRun(new Date());
            }}
          />
        )}
      </Modal>

      <div className="flex w-full h-full">
        <div className="w-full pt-12 pb-6">
          <div>
            <div className="flex items-center justify-between w-full mb-6">
              <h1 className="font-bold text-blue-700">Orders</h1>
            </div>
            <hr />
            <div className="flex items-center w-full">
              <div className="flex w-1/2 mr-1 ">
                <div className="w-full">
                  <label className="text-sm font-bold leading-none">Date Range</label>
                  <div className="flex w-full">
                    <div className="w-1/3">
                      <input
                        className="w-full"
                        defaultValue={format(startOfMonth(new Date()), "yyyy-MM-dd")}
                        {...register("startDate", { required: `Start date required`, valueAsDate: true })}
                        max={format(new Date(), "yyyy-MM-dd")}
                        type="date"
                      />
                      <p className="text-xs text-red-500">{errors?.startDate?.message}</p>
                    </div>

                    <p className="px-6 py-2 pt-3 font-bold text-white bg-blue-500">TO</p>

                    <div className="w-1/3">
                      <input
                        className="w-full"
                        defaultValue={format(new Date(), "yyyy-MM-dd")}
                        {...register("endDate", { required: `End date required`, valueAsDate: true })}
                        type="date"
                        // min={format(new Date(), "yyyy-MM-dd")}
                      />
                      <p className="text-xs text-red-500">{errors?.endDate?.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              {outlets.length > 1 && (
                <div className="w-1/3">
                  <label className="text-sm font-bold leading-none">Outlets</label>
                  <select
                    {...register("outletSelected")}
                    className="block w-full py-3 text-gray-700 bg-white border border-gray-200 rounded appearance-none focus:outline-none focus:ring-1"
                  >
                    <option value="All">{`All Outlets`}</option>
                    {outlets?.map((outlet) => {
                      return (
                        <option key={outlet?.outlet_id} value={outlet?.outlet_id}>
                          {outlet?.outlet_name}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-red-500">{errors["productCategory"]?.message}</p>
                </div>
              )}

              <div className="flex">
                <button
                  disabled={fetching}
                  className={`${
                    fetching ? `bg-gray-200` : `bg-blue-600  focus:ring focus:ring-blue-500`
                  }  px-12 py-3 rounded text-white font-semibold focus:outline-none mt-5 ml-5 h-auto`}
                  onClick={handleSubmit(handleSubmitQuery)}
                >
                  Query
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <MaterialTable
          isLoading={fetching}
          title="Order History"
          icons={tableIcons}
          columns={columns}
          data={orderHistory.map((o) => ({ ...o, tableData: {} }))}
          options={{}}
          actions={[
            {
              icon: () => <i className="text-base text-green-600 fas fa-redo" />,
              tooltip: "Reload",
              onClick: () => {
                setReRun(new Date());
              },
              isFreeAction: true,
            },
          ]}
          onRowClick={(event, rowData) => {
            setComponentToRender("details");
            setOrder(rowData);
            setOpenModal(true);
          }}
          // detailPanel={[
          //   {
          //     tooltip: `Show Order Details`,

          //   },
          // ]}
        />
      </div>
    </>
  );
};

export default SalesHistory;

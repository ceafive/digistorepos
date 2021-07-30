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
import Spinner from "components/Spinner";
import { format, startOfMonth } from "date-fns";
import { setOrderHistory } from "features/orders/ordersSlice";
import { setAllOutlets } from "features/products/productsSlice";
import { filter, intersectionWith, map, upperCase } from "lodash";
import MaterialTable from "material-table";
import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import OrderDetailsComponent from "./OrderDetailsComponent";
import Modal from "components/Modal";

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
  } = useForm();
  const orderHistory = useSelector((state) => state.orders.orderHistory);
  const outlets = useSelector((state) => state.products.outlets);
  // console.log(orderHistory[0]);

  const [fetching, setFetching] = React.useState(false);
  const [outletsString, setOutletsString] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [orderNo, setOrderNo] = React.useState(null);
  const isAdmin = upperCase(user?.user_merchant_group) === "ADMINISTRATORS" ? true : false;

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        dispatch(setAllOutlets([]));
        // dispatch(setOrderHistory([]));
        // TODO: Do not remove this object other methods in /api/orders/get-orders rely on it
        const data = {
          merchant: user?.user_merchant_id,
          outlet: "",
          start_date: format(startOfMonth(new Date()), "dd-MM-yyy"),
          end_date: format(new Date(), "dd-MM-yyyy"),
          isAdmin,
        };

        const outletsRes = await axios.post("/api/sell/sell/get-outlets", { user });
        const { data: outletsResData } = await outletsRes.data;

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

          const outletsString = map(response, (o) => o?.outlet_id).join(",");
          setOutletsString(outletsString);
          data["outlet"] = outletsString;

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
  }, [dispatch]);

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
    },
    {
      title: "Order Amount",
      field: "order_amount",
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
      cellStyle() {
        return {
          width: "100%",
          minWidth: 300,
        };
      },
    },
    {
      title: "Delivery Note",
      field: "delivery_notes",
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
      title: "Phone Created By",
      field: "created_by_name",
    },

    // {
    //   title: "Actions",
    //   field: "actions",
    //   render: (rowData) => {
    //     const icons = [
    //       {
    //         name: "share",
    //         action: () => {},
    //       },
    //       {
    //         name: "envelope",
    //         action: () => {},
    //       },
    //       {
    //         name: "print",
    //         action: () => {},
    //       },
    //     ];
    //     return (
    //       <div className="flex items-center justify-between">
    //         {icons.map((icon) => {
    //           return <i key={icon.name} className={`fas fa-${icon.name} text-gray-200`} />;
    //         })}
    //       </div>
    //     );
    //   },
    // },
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

        const outletsString = values?.outletSelected === "All" ? stringedOutlets : values?.outletSelected;
        data["outlet"] = outletsString;
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
      <Modal open={openModal} onClose={() => setOpenModal(false)} maxWidth="md">
        <OrderDetailsComponent orderNo={orderNo} user={user} onClose={() => setOpenModal(false)} />
      </Modal>
      <div className="flex w-full h-full">
        <div className="w-full pb-6 pt-12">
          <div>
            <div className="flex justify-between items-center w-full mb-6">
              <h1 className="font-bold text-blue-700">Orders</h1>
            </div>
            <hr />
            <div className="flex w-full items-center">
              <div className="flex w-1/2 mr-1 ">
                <div className="w-full">
                  <label className="text-sm leading-none  font-bold">Date Range</label>
                  <div className="flex w-full">
                    <div className="w-1/3">
                      <input
                        className="w-full"
                        {...register("startDate", { required: `Start date required`, valueAsDate: true })}
                        max={format(new Date(), "yyyy-MM-dd")}
                        type="date"
                        defaultValue={format(startOfMonth(new Date()), "yyyy-MM-dd")}
                      />
                      <p className="text-red-500 text-xs">{errors?.startDate?.message}</p>
                    </div>

                    <p className="bg-blue-500 px-6 py-2 pt-3 font-bold text-white">TO</p>

                    <div className="w-1/3">
                      <input
                        className="w-full"
                        {...register("endDate", { required: `End date required`, valueAsDate: true })}
                        type="date"
                        // min={format(new Date(), "yyyy-MM-dd")}
                        defaultValue={format(new Date(), "yyyy-MM-dd")}
                      />
                      <p className="text-red-500 text-xs">{errors?.endDate?.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              {outlets.length > 1 && (
                <div className="w-1/3">
                  <label className="text-sm leading-none font-bold">Outlets</label>
                  <select
                    {...register("outletSelected")}
                    className="block appearance-none w-full border border-gray-200 text-gray-700 py-3 rounded focus:outline-none focus:ring-1 bg-white"
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
          options={
            {
              // filtering: true,
            }
          }
          onRowClick={(event, rowData) => {
            setOrderNo(rowData?.order_no);
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
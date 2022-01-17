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
import PatchedPagination from "components/Misc/PatchedPagination";
import { capitalize, filter, isEmpty, lowerCase } from "lodash";
import MaterialTable, { MTableEditCell, MTableToolbar } from "material-table";
import { useRouter } from "next/router";
import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

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

const ManageProducts = ({ setReRun }) => {
  const router = useRouter();
  const { addToast, removeToast } = useToasts();
  const {
    register,
    watch,
    formState: { errors },
  } = useForm({});

  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);
  const isBooking = user?.user_permissions?.includes("BUKNSMGT") ? true : false || false;

  const categorySelected = watch("productCategory", "All");

  const manageProductProducts = useSelector((state) => state.manageproducts.manageProductProducts);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);

  // console.log({ manageProductProducts });

  const [allProducts, setAllProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (categorySelected !== "All") {
      setLoading(true);
      const filtered = filter(manageProductProducts, (o) => {
        return o?.product_category === categorySelected;
      });

      setAllProducts(filtered);
      setLoading(false);
    } else {
      setLoading(true);
      setAllProducts(manageProductProducts);
      setLoading(false);
    }
  }, [categorySelected, manageProductProducts]);

  const deleteProduct = async (id) => {
    try {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const r = window.confirm("Are you sure you want to delete product?");
      if (r === true) {
        addToast(`Deleting Product...`, { appearance: "info", autoDismiss: true, id: "delete" });

        const deleteProductRes = await axios.post("/api/products/delete-product", { id, username: user?.login });
        const { status, message } = await deleteProductRes.data;

        removeToast(`delete`);

        if (Number(status) === 0) {
          addToast(message, { appearance: "success", autoDismiss: true });
          setReRun(new Date());
        } else {
          addToast(message, { appearance: "error", autoDismiss: true });
        }
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };

        console.log(errorResponse);
        // addToast(errorResponse, { appearance: "error", autoDismiss: true });
      }
    }
  };

  const columns = [
    { title: "Product ID", field: "product_id" },
    { title: "Name", field: "product_name" },
    {
      title: "Description",
      field: "product_description",
      cellStyle() {
        return {
          minWidth: 300,
        };
      },
    },
    { title: "Price", field: "product_price" },
    {
      title: "In Stock",
      field: "inStock",
      render(rowData) {
        return <p>{rowData?.product_quantity === "-99" ? "Unlimited" : rowData?.product_quantity}</p>;
      },
    },
    { title: "Qty. Sold", field: "product_quantity_sold" },
    { title: "Date Added", field: "product_create_date", defaultSort: "desc" },
    { title: "Category", field: "product_category" },
    // {
    //   title: "Actions",
    //   field: "actions",
    //   render(rowData) {
    //     return <Dropdown rowData={rowData} buttons={() => buttons(rowData)} />;
    //   },
    //   disableClick: true,
    // },
  ];

  const updateProductVariant = async (newValue, parentData, childData, columnDef, isUnlimited) => {
    try {
      // console.log(isUnlimited, newValue, columnDef?.field);
      // console.log(columnDef?.field === "variantOptionQuantity" && !isUnlimited && newValue);
      // return;

      if (
        isBooking
          ? columnDef?.field === "variantOptionBookingSlot" && !isUnlimited && !newValue
          : columnDef?.field === "variantOptionQuantity" && !isUnlimited && !newValue
      ) {
        addToast(`Value must be entered...`, { appearance: "error", autoDismiss: true });
        return;
      }

      addToast(`Updating Variant...`, { appearance: "info", autoDismiss: true, id: "update-variant" });
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);
      // console.log(newValue, oldValue, parentData, childData, columnDef);

      const data = {
        variant: childData?.variantOptionId,
        price: columnDef?.field === "variantOptionPrice" ? newValue : childData?.variantOptionPrice,
        slots:
          columnDef?.field === "variantOptionBookingSlot"
            ? isUnlimited
              ? "-99"
              : newValue
            : childData?.variantOptionBookingSlot === "Unlimited"
            ? "-99"
            : childData?.variantOptionBookingSlot || "",
        quantity:
          columnDef?.field === "variantOptionQuantity"
            ? isUnlimited
              ? "-99"
              : newValue
            : childData?.variantOptionQuantity === "Unlimited"
            ? "-99"
            : childData?.variantOptionQuantity,
        product: parentData?.product_id,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      console.log({ data });
      // return;

      const updateVariantRes = await axios.post("/api/products/update-product-variant-props", { data });
      const resData = await updateVariantRes.data;
      const { status, message } = resData;
      console.log({ resData });

      removeToast(`update-variant`);

      if (Number(status) === 0) {
        addToast(message, { appearance: "success", autoDismiss: true });
        setReRun(new Date());
      } else {
        addToast(message, { appearance: "error", autoDismiss: true });
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      console.log(errorResponse);
      // addToast(errorResponse, { appearance: "error", autoDismiss: true });
    }
  };

  const deleteVariant = async (parentData, childData) => {
    try {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const r = window.confirm("Are you sure you want to delete variant?");
      if (r === true) {
        addToast(`Deleting Variant...`, { appearance: "info", autoDismiss: true, id: "delete-variant" });
        const data = {
          variant: childData?.variantOptionId,
          product: parentData?.product_id,
          merchant: user?.user_merchant_id,
          mod_by: user?.login,
        };

        // console.log({ data });

        const deleteVariantRes = await axios.post("/api/products/delete-product-variant", { data });
        const { status, message } = await deleteVariantRes.data;

        removeToast(`delete-variant`);

        if (Number(status) === 0) {
          addToast(message, { appearance: "success", autoDismiss: true });
          setReRun(new Date());
        } else {
          addToast(message, { appearance: "error", autoDismiss: true });
        }
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
        console.log(errorResponse);
      }
    }
  };

  return (
    <>
      <div className="flex w-full h-full">
        <div className="w-full pt-6 pb-6">
          <div>
            <div className="flex items-center justify-between w-full mb-6">
              <h1 className="font-bold text-blue-700">Products</h1>
              <button
                className="px-2 py-1 font-semibold text-white bg-green-600 rounded focus:ring focus:outline-none focus:ring-green-500"
                onClick={() => {
                  router.push("/products/create");
                }}
              >
                Create New Product
              </button>
            </div>
            <hr />
            <div className="flex items-center w-full">
              <div className="w-1/2">
                <label className="text-sm font-bold leading-none">Product Categories</label>
                <select
                  {...register("productCategory")}
                  className="block w-full py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded appearance-none focus:outline-none"
                >
                  <option value="All">{`All`}</option>
                  {manageProductCategories?.map((category) => {
                    return (
                      <option key={category?.product_category_id} value={category?.product_category}>
                        {category?.product_category}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-red-500">{errors["productCategory"]?.message}</p>
              </div>
              {/* <div>
                <button className="px-4 py-1 mt-6 ml-2 font-bold text-white bg-green-500 rounded">View Variance</button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <div>
        <MaterialTable
          isLoading={loading}
          title={<p className="text-xl font-bold">{`Products: ${capitalize(categorySelected)}`}</p>}
          icons={tableIcons}
          columns={columns}
          data={allProducts.map((o) => ({ ...o, tableData: {} }))}
          actions={[
            {
              icon: "visibility",
              tooltip: `View Details`,
              iconProps: {
                color: "primary",
              },
              onClick(e, row) {
                const viewLink = `/products/view?product_id=${row?.product_id}`;
                router.push(viewLink);
              },
            },
            {
              icon: "edit",
              tooltip: `Edit Product`,
              iconProps: {
                color: "primary",
              },
              onClick(e, row) {
                console.log();
                const viewLink = `/products/edit?product_id=${row?.product_id}&hasVariants=${
                  row?.product_properties && !isEmpty(row?.product_properties) ? "yes" : "no"
                }`;
                router.push(viewLink);
              },
            },
            {
              icon: "delete",
              tooltip: `Delete Product`,
              iconProps: {
                color: "error",
              },
              async onClick(e, row) {
                await deleteProduct(row?.product_id);
              },
            },
          ]}
          options={{
            selection: false,
            padding: "dense",
            actionsColumnIndex: -1,
          }}
          components={{
            Toolbar: (props) => (
              <div>
                <MTableToolbar {...props} />
              </div>
            ),
            Pagination: PatchedPagination,
          }}
          onRowClick={(event, rowData, togglePanel) => togglePanel()}
          detailPanel={[
            {
              tooltip: "Show Variants",
              iconProps: {
                // color: rowData?.product_properties_variants ? `primary` : `disabled`,
              },
              render: (rowData) => {
                if (!rowData?.product_properties_variants) return null;
                // console.log(rowData);

                const detailColumns = [
                  { title: "ID", field: "variantOptionId", editable: "never" },
                  {
                    title: "Name",
                    field: "name",
                    editable: "never",
                    searchable: true,
                    customFilterAndSearch: (term, rowData) => {
                      const variantdata = Object.keys(rowData?.variantOptionValue).map((value) => lowerCase(value));
                      const result = variantdata.join("").indexOf(lowerCase(term)) != -1;
                      return result;
                    },
                    render(rowData) {
                      let subheader = "";
                      const variantdata = Object.entries(rowData?.variantOptionValue);
                      variantdata.forEach(([, value], index) => {
                        subheader += `${value}${index === variantdata?.length - 1 ? " " : " / "}`;
                      });
                      return (
                        <div>
                          <h6>{subheader}</h6>
                        </div>
                      );
                    },
                  },
                  {
                    title: "Description",
                    field: "description",
                    editable: "never",
                    searchable: true,
                    customFilterAndSearch: (term, rowData) => {
                      const variantdata = Object.values(rowData?.variantOptionValue).map((value) => lowerCase(value));
                      const result = variantdata.join("").indexOf(lowerCase(term)) != -1;
                      return result;
                    },
                    render(rowData) {
                      let header = "";
                      const variantdata = Object.entries(rowData?.variantOptionValue);
                      variantdata.forEach(([key], index) => {
                        header += `${key}${index === variantdata?.length - 1 ? " " : " / "}`;
                      });
                      return (
                        <div>
                          <h6>{header}</h6>
                        </div>
                      );
                    },
                  },
                  {
                    title: "Price",
                    field: "variantOptionPrice",
                    cellStyle() {
                      return {
                        width: 400,
                      };
                    },
                  },
                  {
                    title: isBooking ? "No. of slots" : "In Stock",
                    field: isBooking ? "variantOptionBookingSlot" : "variantOptionQuantity",
                    cellStyle() {
                      return {
                        width: 400,
                      };
                    },
                    render(rowData) {
                      if (isBooking) {
                        return (
                          <p>
                            {rowData?.variantOptionBookingSlot === "-99"
                              ? "Unlimited"
                              : rowData?.variantOptionBookingSlot === "0"
                              ? "Out of Stock"
                              : rowData?.variantOptionBookingSlot}
                          </p>
                        );
                      } else {
                        return (
                          <p>
                            {rowData?.variantOptionQuantity === "-99"
                              ? "Unlimited"
                              : rowData?.variantOptionQuantity === "0"
                              ? "Out of Stock"
                              : rowData?.variantOptionQuantity}
                          </p>
                        );
                      }
                    },
                  },

                  { title: isBooking ? "Slots Booked" : "Qty. Sold", field: "variantOptionQuantitySold", editable: "never" },
                  { title: "Last Stock Date", field: "variantOptionLastStockUpdated", editable: "never" },
                  {
                    title: "Action",
                    field: "delete",
                    editable: "never",
                    render(detailRowData) {
                      return (
                        <button
                          className="px-4 py-2 text-white bg-red-500 rounded shadow-sm focus:outline-none focus:ring-red-600 focus:ring-2"
                          onClick={() => {
                            deleteVariant(rowData, detailRowData);
                          }}
                        >
                          Delete
                        </button>
                      );
                    },
                  },
                ];

                return (
                  <MaterialTable
                    style={{
                      backgroundColor: "rgb(249, 250, 251)",
                      border: "1px solid green",
                      overflow: "hidden",
                    }}
                    cellEditable={{
                      onCellEditApproved: async (newValue, oldValue, childRowData, columnDef, isUnlimited) => {
                        await updateProductVariant(newValue, rowData, childRowData, columnDef, isUnlimited);
                      },
                    }}
                    isLoading={loading}
                    title="Variants"
                    icons={tableIcons}
                    columns={detailColumns}
                    data={rowData?.product_properties_variants.map((o) => ({ ...o, tableData: {} }))}
                    options={{
                      padding: "dense",
                      headerStyle: {
                        backgroundColor: "rgba(30, 41, 59)",
                        color: "#FFF",
                        fontSize: 14,
                        // rowStyle: { `&:hover`: {backgroundColor: `#EEE`}}
                      },
                    }}
                    components={{
                      EditCell: (props) => {
                        // console.log(props);
                        const [isUnlimited, setIsUnlimited] = React.useState(
                          ["Unlimited", "-99"].includes(isBooking ? props?.rowData?.variantOptionBookingSlot : props?.rowData?.variantOptionQuantity)
                        );
                        const [newQuantity, setNewQuantity] = React.useState(
                          isBooking
                            ? props?.rowData?.variantOptionBookingSlot === "-99"
                              ? ""
                              : props?.rowData?.variantOptionBookingSlot
                            : props?.rowData?.variantOptionQuantity === "-99"
                            ? ""
                            : props?.rowData?.variantOptionQuantity
                        );

                        if (props?.columnDef?.field === "variantOptionBookingSlot") {
                          return (
                            <td
                              style={{
                                boxShadow: "2px 0px 15px rgba(125,147,178,.25)",
                                color: "inherit",
                                width: props.columnDef.tableData.width,
                                fontSize: "inherit",
                                fontFamily: "inherit",
                                fontWeight: "inherit",
                                padding: "0 16px",
                              }}
                            >
                              <div className="flex items-center w-full">
                                <input
                                  disabled={isUnlimited}
                                  value={newQuantity}
                                  onChange={(e) => {
                                    e.persist();
                                    setNewQuantity(e.target.value);
                                  }}
                                  min="0"
                                  type={isUnlimited ? "text" : "number"}
                                  placeholder="eg. 100"
                                  className="w-32 px-3 py-2 text-sm bg-white border border-black rounded outline-none placeholder-blueGray-300 text-blueGray-600 focus:outline-none focus:ring-1 "
                                />

                                <div className="flex items-center ml-2">
                                  <input
                                    name="quantityUnlimited"
                                    type="checkbox"
                                    checked={isUnlimited}
                                    onChange={async (e) => {
                                      setIsUnlimited(e.target.checked);
                                    }}
                                  />

                                  <label className="text-xs ml-1">Unlimited</label>
                                  <button
                                    className="p-2 focus:outline-none text-green-500"
                                    onClick={() => {
                                      props.cellEditable?.onCellEditApproved(
                                        newQuantity,
                                        props.rowData[props.columnDef.field],
                                        props.rowData,
                                        props.columnDef,
                                        isUnlimited
                                      );
                                    }}
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    className="p-2 focus:outline-none text-red-500"
                                    onClick={() => {
                                      props.onCellEditFinished(props.rowData, props.columnDef);
                                    }}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        } else if (props?.columnDef?.field === "variantOptionQuantity") {
                          return (
                            <td
                              style={{
                                boxShadow: "2px 0px 15px rgba(125,147,178,.25)",
                                color: "inherit",
                                width: props.columnDef.tableData.width,
                                fontSize: "inherit",
                                fontFamily: "inherit",
                                fontWeight: "inherit",
                                padding: "0 16px",
                              }}
                            >
                              <div className="flex items-center w-full">
                                <input
                                  disabled={isUnlimited}
                                  value={newQuantity}
                                  onChange={(e) => {
                                    e.persist();
                                    setNewQuantity(e.target.value);
                                  }}
                                  min="0"
                                  type={isUnlimited ? "text" : "number"}
                                  placeholder="eg. 100"
                                  className="w-32 px-3 py-2 text-sm bg-white border border-black rounded outline-none placeholder-blueGray-300 text-blueGray-600 focus:outline-none focus:ring-1 "
                                />

                                <div className="flex items-center ml-2">
                                  <input
                                    name="quantityUnlimited"
                                    type="checkbox"
                                    checked={isUnlimited}
                                    onChange={async (e) => {
                                      setIsUnlimited(e.target.checked);
                                    }}
                                  />

                                  <label className="text-xs ml-1">Unlimited</label>
                                  <button
                                    className="p-2 focus:outline-none text-green-500"
                                    onClick={() => {
                                      props.cellEditable?.onCellEditApproved(
                                        newQuantity,
                                        props.rowData[props.columnDef.field],
                                        props.rowData,
                                        props.columnDef,
                                        isUnlimited
                                      );
                                    }}
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    className="p-2 focus:outline-none text-red-500"
                                    onClick={() => {
                                      props.onCellEditFinished(props.rowData, props.columnDef);
                                    }}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        } else {
                          return <MTableEditCell {...props} />;
                        }
                      },

                      Pagination: PatchedPagination,
                    }}
                  />
                );
              },
            },
          ]}
        />
      </div>
    </>
  );
};

export default ManageProducts;

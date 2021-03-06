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
import Dropdown from "components/Misc/Dropdown";
import PatchedPagination from "components/Misc/PatchedPagination";
import Modal from "components/Modal";
import { setManageProductCategories, setShowAddCategoryModal } from "features/manageproducts/manageproductsSlice";
import { capitalize, filter } from "lodash";
import MaterialTable, { MTableBodyRow, MTableToolbar } from "material-table";
import { useRouter } from "next/router";
import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import AddCategory from "../create/AddCategory";

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

const ManageCategories = ({ setReRun }) => {
  const dispatch = useDispatch();
  const { addToast, removeToast } = useToasts();
  const router = useRouter();
  const {
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({});

  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const showAddCategoryModal = useSelector((state) => state.manageproducts.showAddCategoryModal);

  // console.log({ manageProductCategories });

  const [processing, setProcessing] = React.useState(false);
  const [allCategories, setAllCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [isEditing, setIsEditing] = React.useState(false);

  const categorySelected = watch("productCategory", "All");
  const [btnText, setBtnText] = React.useState("Edit Category");
  const [addCatValues, setAddCatValues] = React.useState({});

  React.useEffect(() => {
    setLoading(true);
    if (categorySelected !== "All") {
      const filtered = filter(manageProductCategories, (o) => {
        return o?.product_category === categorySelected;
      });
      const allCategories = filtered.map((o) => ({ ...o, tableData: {} }));
      setAllCategories(allCategories);
    } else {
      const allCategories = [...manageProductCategories].map((o) => ({ ...o, tableData: {} }));
      setAllCategories(allCategories);
    }
    setLoading(false);
  }, [manageProductCategories, categorySelected]);

  const buttons = (data) => [
    {
      name: "Edit",
      action() {
        setBtnText("Edit Category");
        setAddCatValues({
          categoryName: data?.product_category,
          categoryDescription: data?.product_category_description,
          categoryID: data?.product_category_id,
        });
        // addCategorySetValue("categoryName", data?.product_category);
        // addCategorySetValue("categoryDescription", data?.product_category_description);
        // addCategorySetValue("categoryID", data?.product_category_id);
        setIsEditing(true);
        dispatch(setShowAddCategoryModal());
      },
    },
    {
      name: "Delete",
      classes: "text-red-500",
      async action() {
        var r = window.confirm(`Are you sure you want to delete category '${data?.product_category}'. This action cannot be undone`);
        if (r == true) {
          // call api
          await deleteCategory(data?.product_category_id);
        }
      },
    },
  ];

  const columns = [
    { title: "ID.", field: "product_category_id" },
    { title: "Category Name", field: "product_category" },
    { title: "Description", field: "product_category_description" },
    {
      title: "Products Under Category",
      field: "product_count",
    },
    { title: "Mod. By", field: "mod_by" },
    { title: "Mod. Date", field: "mod_date" },
    {
      title: "Actions",
      field: "actions",
      render(rowData) {
        return <Dropdown buttons={() => buttons(rowData)} />;
      },
    },
  ];

  const DragState = {
    row: -1,
    dropIndex: -1, // drag target
  };

  const onRowSelected = (_evt, rowData) => {
    // console.log({ rowData });
  };

  const displaceObject = (fromIndex, toIndex, arrayToBeModified) => {
    let modCollection = [...arrayToBeModified];
    if (fromIndex < toIndex) {
      let start = arrayToBeModified.slice(0, fromIndex),
        between = arrayToBeModified.slice(fromIndex + 1, toIndex + 1),
        end = arrayToBeModified.slice(toIndex + 1);
      modCollection = [...start, ...between, arrayToBeModified[fromIndex], ...end];
    }
    if (fromIndex > toIndex) {
      let start = arrayToBeModified.slice(0, toIndex),
        between = arrayToBeModified.slice(toIndex, fromIndex),
        end = arrayToBeModified.slice(fromIndex + 1);
      modCollection = [...start, arrayToBeModified[fromIndex], ...between, ...end];
    }
    return modCollection;
  };

  const deleteCategory = async (id) => {
    try {
      setProcessing(true);
      addToast(`Deleting....`, { appearance: "info", id: "deleting" });
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const response = await axios.post("/api/products/delete-category", { id });
      const { status, message } = await response.data;
      removeToast("deleting");

      if (status === 0) {
        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const filtered = filter(allCategoriesResData, (o) => Boolean(o));
        dispatch(setManageProductCategories(filtered));

        addToast(message, { appearance: "success", autoDismiss: true });
      } else addToast(`${message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      addToast(`${errorResponse}. Fix error and try again`, { appearance: "error", autoDismiss: true });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Modal open={showAddCategoryModal} onClose={() => dispatch(setShowAddCategoryModal())} maxWidth="sm">
        <AddCategory
          processing={processing}
          setValue={() => {}}
          btnText={btnText}
          setProcessing={setProcessing}
          action={"manageCategories"}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          addCatValues={addCatValues}
        />
      </Modal>

      <div className="flex w-full h-full">
        <div className="w-full pb-6 pt-12">
          <div>
            <div className="flex justify-between items-center w-full mb-6">
              <h1 className="font-bold text-blue-700">Categories</h1>
              <button
                className="bg-green-600 px-2 py-1 rounded text-white font-semibold focus:ring focus:outline-none focus:ring-green-500"
                onClick={() => {
                  setBtnText("Add New Category");
                  setIsEditing(false);
                  dispatch(setShowAddCategoryModal());
                }}
              >
                Add New Category
              </button>
            </div>
            <hr />
            <div className="flex w-full items-center">
              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">Categories</label>
                <select
                  {...register("productCategory")}
                  className="block appearance-none w-full border border-gray-200 text-gray-700 py-2 rounded focus:outline-none text-sm bg-white"
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
                <button className="bg-green-500 px-4 py-1 text-white ml-2 rounded font-bold mt-6">View Variance</button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <div>
        <MaterialTable
          isLoading={processing || loading}
          title={<p className="font-bold text-xl">{`Category: ${capitalize(categorySelected)}`}</p>}
          icons={tableIcons}
          columns={columns}
          data={allCategories}
          actions={[
            {
              icon: "drag_indicator",
              tooltip: "Drag Row",
              onClick: (event, rowData) => {
                // Do save operation
              },
            },
          ]}
          components={{
            Toolbar: (props) => (
              <div>
                <MTableToolbar {...props} />
              </div>
            ),
            Pagination: PatchedPagination,
            Row: (interProps) => (
              <MTableBodyRow
                {...interProps}
                draggable="true"
                onDragStart={() => {
                  DragState.row = interProps.data.tableData.id;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDragEnter={() => {
                  // console.log(interProps);
                  if (interProps.data.tableData.id !== DragState.row) {
                    DragState.dropIndex = interProps.data.tableData.id;
                  }
                }}
                onDragEnd={async () => {
                  try {
                    if (DragState.dropIndex !== -1) {
                      const data = displaceObject(DragState.row, DragState.dropIndex, manageProductCategories);
                      const dataToSend = data.map((val) => {
                        return {
                          category_id: val?.product_category_id,
                          category_level: val?.product_category_level,
                        };
                      });

                      const reformatteddDataToSend = dataToSend.map((item, index) => {
                        return {
                          category_id: item?.category_id,
                          category_level: index + 1,
                        };
                      });
                      // console.log({ reformatteddDataToSend });

                      setProcessing(true);
                      addToast(`Rearranging....`, { appearance: "info", autoDismiss: true });

                      let user = sessionStorage.getItem("IPAYPOSUSER");
                      user = JSON.parse(user);

                      const payload = {
                        category_list: JSON.stringify(reformatteddDataToSend),
                        merchant: user?.user_merchant_id,
                        mod_by: user?.login,
                      };

                      const response = await axios.post("/api/products/rearrange-categories", payload);
                      const { status, message } = await response.data;

                      if (Number(status) === 0) {
                        addToast(message, { appearance: "success", autoDismiss: true });

                        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
                        const { data: allCategoriesResData } = await allCategoriesRes.data;
                        // console.log({ allCategoriesResData });
                        dispatch(setManageProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
                        // setReRUn(new Date());
                      } else {
                        addToast(message, { appearance: "error", autoDismiss: true });
                      }
                    }
                    DragState.row = -1;
                    DragState.dropIndex = -1;
                  } catch (error) {
                    console.log(error);
                  } finally {
                    setProcessing(false);
                  }
                }}
              />
            ),
          }}
          onRowClick={onRowSelected}
        />
      </div>
    </>
  );
};

export default ManageCategories;

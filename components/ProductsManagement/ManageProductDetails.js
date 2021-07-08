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
import { setProductHasVariants, setProductWithVariants } from "features/manageproducts/manageprodcutsSlice";
import { capitalize, filter } from "lodash";
import MaterialTable, { MTableToolbar } from "material-table";
import { useRouter } from "next/router";
import React, { forwardRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

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

const ManageProductDetails = ({ setGoToVarianceConfig }) => {
  const dispatch = useDispatch();
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

  const categorySelected = watch("productCategory", "ALL");

  const manageProductProducts = useSelector((state) => state.manageproducts.manageProductProducts);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);

  const [allProducts, setAllProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    if (categorySelected !== "ALL") {
      const filtered = filter(manageProductProducts, (o) => {
        return o?.product_category === categorySelected;
      });

      setAllProducts(filtered);
    } else {
      setAllProducts(manageProductProducts);
    }
    setLoading(false);
  }, [categorySelected]);

  const columns = [
    { title: "No.", field: "product_id" },
    { title: "Name", field: "product_name" },
    { title: "Description", field: "product_category_description" },
    { title: "Price", field: "product_price" },
    {
      title: "In Stock",
      field: "inStock",
      render(rowData) {
        return <p>{rowData?.product_quantity === "-99" ? "Unlimited" : rowData?.product_quantity}</p>;
      },
    },
    { title: "Qty. Sold", field: "product_quantity_sold" },
    { title: "Date Added", field: "product_create_date" },
    { title: "Category", field: "product_category" },
    { title: "Actions", field: "actions" },
  ];

  return (
    <>
      <h1>Products</h1>
      <hr />
      <p>
        Setup and manage your products and inventory; assign products to your outlet(s) or shop(s) customers can buy from and manage∏
        products/orders all in ONE ACCOUNT
      </p>
      <div className="flex w-full h-full">
        <div className="w-full pb-6 pt-12">
          <div>
            <div className="flex justify-between items-center w-full mb-6">
              <h1 className="font-bold text-blue-700">Products</h1>
              <button
                className="bg-green-500 px-2 py-1 rounded text-white font-semibold focus:ring focus:outline-none focus:ring-green-500"
                onClick={() => {
                  router.push("/products/create");
                }}
              >
                Create New Product
              </button>
            </div>
            <hr />
            <div className="flex w-full items-center">
              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">Product Categories</label>
                <select
                  {...register("productCategory")}
                  className="block appearance-none w-full border border-gray-200 text-gray-700 py-2 rounded focus:outline-none text-sm bg-white"
                >
                  <option value="ALL">{`ALL`}</option>
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
          loading={loading}
          title={`Category: ${capitalize(categorySelected)}`}
          icons={tableIcons}
          columns={columns}
          data={allProducts.map((o) => ({ ...o, tableData: {} }))}
          components={{
            Toolbar: (props) => (
              <div>
                <MTableToolbar {...props} />
                <div style={{ padding: "0px 10px" }}>
                  <p label="Chip 1" color="secondary" style={{ marginRight: 5 }} />
                  <p label="Chip 2" color="secondary" style={{ marginRight: 5 }} />
                  <p label="Chip 3" color="secondary" style={{ marginRight: 5 }} />
                  <p label="Chip 4" color="secondary" style={{ marginRight: 5 }} />
                  <p label="Chip 5" color="secondary" style={{ marginRight: 5 }} />
                </div>
              </div>
            ),
          }}
        />
      </div>
    </>
  );
};

export default ManageProductDetails;

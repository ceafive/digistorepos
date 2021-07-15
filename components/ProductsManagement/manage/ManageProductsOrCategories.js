import axios from "axios";
import Spinner from "components/Spinner";
import {
  setManageProductCategories,
  setManageProductOutlets,
  setManageProductProducts,
  setProductHasVariants,
  setProductWithVariants,
} from "features/manageproducts/manageprodcutsSlice";
import { filter } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import ManageCategories from "./ManageCategories";
import ManageProducts from "./ManageProducts";

const ManageProductsOrCategories = () => {
  const dispatch = useDispatch();
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [tabSelected, setTabSelected] = React.useState("products");
  const [reRUn, setReRUn] = React.useState(new Date());
  // Compnent State

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allProductsRes = await axios.post("/api/products/get-products", { user });
        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const allOutletsRes = await axios.post("/api/products/get-outlets", { user });

        const { data: allProductsResData } = await allProductsRes.data;
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const { data: allOutletsResData } = await allOutletsRes.data;

        dispatch(setManageProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
        dispatch(setManageProductProducts(filter(allProductsResData, (o) => Boolean(o))));
        dispatch(setManageProductOutlets(filter(allOutletsResData, (o) => Boolean(o))));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();

    // clear data
    return () => {
      dispatch(setProductHasVariants({}));
      dispatch(setProductWithVariants(false));
    };
  }, [reRUn]);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <div>
      <h1>Products</h1>
      <hr />
      <p>
        Setup and manage your products and inventory; assign products to your outlet(s) or shop(s) customers can buy from and manage
        products/orders all in ONE ACCOUNT
      </p>
      <div className="mt-6 pl-6">
        <button
          className={`mx-4 font-bold ${tabSelected === "products" ? "text-green-600" : "text-blue-600"}  focus:outline-none`}
          onClick={() => {
            setTabSelected("products");
          }}
        >
          Products
        </button>{" "}
        {"  | "}
        <button
          className={`mx-4 font-bold ${tabSelected === "categories" ? "text-green-600" : "text-blue-600"} focus:outline-none`}
          onClick={() => {
            setTabSelected("categories");
          }}
        >
          Categories
        </button>{" "}
        {"  | "}
        <button
          className={`mx-4 font-bold ${tabSelected === "outlets" ? "text-green-600" : "text-blue-600"} focus:outline-none`}
          onClick={() => {
            setTabSelected("outlets");
          }}
        >
          Outlet Products
        </button>
      </div>
      {tabSelected === "products" && <ManageProducts setReRUn={setReRUn} />}
      {tabSelected === "categories" && <ManageCategories setReRUn={setReRUn} />}
    </div>
  );
};

export default ManageProductsOrCategories;

import axios from "axios";
import Spinner from "components/Spinner";
import { setManageProductCategories, setManageProductOutlets, setManageProductProducts } from "features/manageproducts/manageproductsSlice";
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
  const [reRUn, setReRun] = React.useState(new Date());

  // Compnent State

  const manageProductProducts = useSelector((state) => state.manageproducts.manageProductProducts);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        if (manageProductProducts?.length === 0) {
          setFetching(true);
        }

        if (manageProductOutlets?.length === 0) {
          setFetching(true);
        }

        if (manageProductCategories?.length === 0) {
          setFetching(true);
        }

        const allProductsRes = await axios.post("/api/products/get-products", { user });
        const { data: allProductsResData } = await allProductsRes.data;
        dispatch(setManageProductProducts(filter(allProductsResData, (o) => Boolean(o))));

        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        dispatch(setManageProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));

        const allOutletsRes = await axios.post("/api/products/get-outlets", { user });
        const { data: allOutletsResData } = await allOutletsRes.data;
        dispatch(setManageProductOutlets(filter(allOutletsResData, (o) => Boolean(o))));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();

    // clear data
    return () => {};
  }, [reRUn]);

  if (fetching || fetching === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen-75">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h1>Products</h1>
      <hr />
      <p>
        Setup and manage your products and inventory; assign products to your outlet(s) or shop(s) customers can buy from and manage products/orders
        all in ONE ACCOUNT
      </p>
      <div className="mt-6">
        <button
          className={`mr-2 font-bold ${tabSelected === "products" ? "text-green-600" : "text-blue-600"}  focus:outline-none`}
          onClick={() => {
            setTabSelected("products");
          }}
        >
          Products
        </button>{" "}
        {"  | "}
        <button
          className={`mx-2 font-bold ${tabSelected === "categories" ? "text-green-600" : "text-blue-600"} focus:outline-none`}
          onClick={() => {
            setTabSelected("categories");
          }}
        >
          Categories
        </button>{" "}
      </div>
      {tabSelected === "products" && <ManageProducts setReRun={setReRun} />}
      {tabSelected === "categories" && <ManageCategories setReRun={setReRun} />}
    </div>
  );
};

export default ManageProductsOrCategories;

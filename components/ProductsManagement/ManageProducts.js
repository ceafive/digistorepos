import axios from "axios";
import ManageProductDetails from "components/ProductsManagement/ManageProductDetails";
import Spinner from "components/Spinner";
import { setManageProductCategories, setManageProductProducts } from "features/manageproducts/manageprodcutsSlice";
import { filter } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const ManageProducts = () => {
  const dispatch = useDispatch();
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  // Compnent State

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allProductsRes = await axios.post("/api/products/get-products", { user });
        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });

        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const { data: allProductsResData } = await allProductsRes.data;
        dispatch(setManageProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
        dispatch(setManageProductProducts(filter(allProductsResData, (o) => Boolean(o))));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return <>{<ManageProductDetails />}</>;
};

export default ManageProducts;

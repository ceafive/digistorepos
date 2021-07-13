import axios from "axios";
import AddBasicProductDetails from "components/ProductsManagement/create/AddBasicProductDetails";
import Spinner from "components/Spinner";
import { setManageProductCategories, setManageProductOutlets } from "features/manageproducts/manageprodcutsSlice";
import { filter } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import EditProduct from "./EditProduct";
import EditProductAndVariants from "./EditProductAndVariants";
import ViewProduct from "./ViewProduct";

const ViewEditAProduct = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const manageProductProducts = useSelector((state) => state.manageproducts.manageProductProducts);

  //   console.log(router);
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [productToViewOrEdit, setProductToViewOrEdit] = React.useState(null);

  React.useEffect(() => {
    setFetching(true);
    const found = manageProductProducts.find((product) => product?.product_id === router?.query?.product_id);
    setProductToViewOrEdit(found);
    setFetching(false);
  }, [router]);

  if (fetching || productToViewOrEdit === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      {router?.query?.action === "view" && <ViewProduct product={productToViewOrEdit} />}{" "}
      {router?.query?.action === "edit" && <EditProductAndVariants product={productToViewOrEdit} />}
    </>
  );
};

export default ViewEditAProduct;

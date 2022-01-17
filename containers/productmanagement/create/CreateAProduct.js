import axios from "axios";
import Spinner from "components/Spinner";
import AddBasicProductDetails from "containers/productmanagement/create/AddBasicProductDetails";
import {
  setManageProductCategories,
  setManageProductOutlets,
  setProductHasVariants,
  setProductWithVariants,
} from "features/manageproducts/manageproductsSlice";
import { filter } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import VarianceConfiguaration from "./VarianceConfiguaration";

const CreateAProduct = () => {
  const dispatch = useDispatch();
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        if (manageProductOutlets?.length === 0) {
          setFetching(true);
        }

        if (manageProductCategories?.length === 0) {
          setFetching(true);
        }

        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const allOutletsRes = await axios.post("/api/products/get-outlets", { user });

        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const { data: allOutletsResData } = await allOutletsRes.data;
        // console.log({ allOutletsResData });

        dispatch(setManageProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
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
      dispatch(setProductWithVariants({}));
      dispatch(setProductHasVariants(false));
    };
  }, [dispatch]);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      {!goToVarianceConfig && <AddBasicProductDetails setGoToVarianceConfig={setGoToVarianceConfig} />}
      {goToVarianceConfig && <VarianceConfiguaration setGoToVarianceConfig={setGoToVarianceConfig} />}
    </>
  );
};

export default CreateAProduct;

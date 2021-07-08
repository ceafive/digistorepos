import axios from "axios";
import AddBasicProductDetails from "components/ProductsManagement/AddBasicProductDetails";
import Spinner from "components/Spinner";
import { setManageProductCategories } from "features/manageproducts/manageprodcutsSlice";
import { filter } from "lodash";
import React from "react";
import { useDispatch } from "react-redux";

import VarianceConfiguaration from "./VarianceConfiguaration";

const CreateAProduct = () => {
  const dispatch = useDispatch();
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });

        const { data: allCategoriesResData } = await allCategoriesRes.data;
        // console.log({ outletsResData, user_assigned_outlets, response });

        dispatch(setManageProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
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

  return (
    <>
      {!goToVarianceConfig && <AddBasicProductDetails setGoToVarianceConfig={setGoToVarianceConfig} />}
      {goToVarianceConfig && <VarianceConfiguaration setGoToVarianceConfig={setGoToVarianceConfig} />}
    </>
  );
};

export default CreateAProduct;

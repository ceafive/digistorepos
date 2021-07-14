import { setProductHasVariants, setProductWithVariants } from "features/manageproducts/manageprodcutsSlice";
import React from "react";
import { useDispatch } from "react-redux";

import EditProduct from "./EditProduct";
import EditVariance from "./EditVariance";

const EditProductAndVariants = ({ product }) => {
  const dispatch = useDispatch();
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  React.useEffect(() => {
    // clear data
    return () => {
      dispatch(setProductHasVariants({}));
      dispatch(setProductWithVariants(false));
    };
  }, []);

  return (
    <div>
      {!goToVarianceConfig && <EditProduct product={product} setGoToVarianceConfig={setGoToVarianceConfig} />}
      {goToVarianceConfig && <EditVariance product={product} setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditProductAndVariants;

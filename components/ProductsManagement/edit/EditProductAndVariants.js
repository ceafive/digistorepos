import React from "react";

import EditProduct from "./EditProduct";
import EditProductVariance from "./EditProductVariance";

const EditProductAndVariants = ({ product }) => {
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);
  return (
    <div>
      {!goToVarianceConfig && <EditProduct product={product} setGoToVarianceConfig={setGoToVarianceConfig} />}
      {goToVarianceConfig && <EditProductVariance product={product} setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditProductAndVariants;

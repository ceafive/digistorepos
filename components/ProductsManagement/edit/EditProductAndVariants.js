import React from "react";

import EditProduct from "./EditProduct";
import EditVariance from "./EditVariance";

const EditProductAndVariants = ({ product }) => {
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);
  return (
    <div>
      {!goToVarianceConfig && <EditProduct product={product} setGoToVarianceConfig={setGoToVarianceConfig} />}
      {goToVarianceConfig && <EditVariance product={product} setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditProductAndVariants;

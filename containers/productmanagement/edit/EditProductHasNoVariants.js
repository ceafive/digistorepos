import React from "react";

import EditProductNoVariants from "./EditProductNoVariants";
import EditProductNoVariantsVariance from "./EditProductNoVariantsVariance";

const EditProductAndVariants = ({}) => {
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  return (
    <div>
      {!goToVarianceConfig && <EditProductNoVariants setGoToVarianceConfig={setGoToVarianceConfig} />}
      {goToVarianceConfig && <EditProductNoVariantsVariance setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditProductAndVariants;

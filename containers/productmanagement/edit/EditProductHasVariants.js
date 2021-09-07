import React from "react";

import EditProductVariants from "./EditProductVariants";
import EditVariance from "./EditVariance";

const EditProductHasVariants = ({
  fields,
  append,
  remove,
  control,
  register,
  reset,
  watch,
  setValue,
  clearErrors,
  errors,
  handleSubmit,
  fetching,
  setRefetch,
}) => {
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  return (
    <div>
      {!goToVarianceConfig && <EditProductVariants setGoToVarianceConfig={setGoToVarianceConfig} setRefetch={setRefetch} />}

      {goToVarianceConfig && <EditVariance setGoToVarianceConfig={setGoToVarianceConfig} setRefetch={setRefetch} />}
    </div>
  );
};

export default EditProductHasVariants;

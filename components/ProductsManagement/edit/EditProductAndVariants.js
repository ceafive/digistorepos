import { setProductHasVariants, setProductWithVariants } from "features/manageproducts/manageprodcutsSlice";
import React from "react";
import { useDispatch } from "react-redux";

import EditProduct from "./EditProduct";
import EditVariance from "./EditVariance";

const EditProductAndVariants = ({ fields, append, remove, control, register, reset, watch, setValue, errors, handleSubmit, fetching }) => {
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  return (
    <div>
      {!goToVarianceConfig && (
        <EditProduct
          fields={fields}
          append={append}
          remove={remove}
          fetching={fetching}
          register={register}
          reset={reset}
          watch={watch}
          setValue={setValue}
          errors={errors}
          handleSubmit={handleSubmit}
          control={control}
          setGoToVarianceConfig={setGoToVarianceConfig}
        />
      )}
      {goToVarianceConfig && <EditVariance setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditProductAndVariants;

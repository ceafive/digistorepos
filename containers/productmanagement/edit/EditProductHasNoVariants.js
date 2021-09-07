import React from "react";

import EditProductNoVariants from "./EditProductNoVariants";
import EditVariance from "./EditVariance";

const EditProductAndVariants = ({
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
}) => {
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

  return (
    <div>
      {!goToVarianceConfig && (
        <EditProductNoVariants
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
          clearErrors={clearErrors}
          control={control}
          setGoToVarianceConfig={setGoToVarianceConfig}
        />
      )}
      {goToVarianceConfig && <EditVariance setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditProductAndVariants;
import AddBasicProductDetails from "components/ProductsManagement/AddBasicProductDetails";
import Spinner from "components/Spinner";
import React from "react";
import VarianceConfiguaration from "./VarianceConfiguaration";

const CreateAProduct = () => {
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);

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

import AddBasicProductDetails from "components/ProductsManagement/AddBasicProductDetails";
import Spinner from "components/Spinner";
import React from "react";

const CreateAProduct = () => {
  // Compnent State
  const [fetching, setFetching] = React.useState(false);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      <AddBasicProductDetails />
    </>
  );
};

export default CreateAProduct;

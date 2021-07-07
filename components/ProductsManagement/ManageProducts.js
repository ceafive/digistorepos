import ManageProductDetails from "components/ProductsManagement/ManageProductDetails";
import Spinner from "components/Spinner";
import React from "react";

const ManageProducts = () => {
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

  return <>{<ManageProductDetails />}</>;
};

export default ManageProducts;

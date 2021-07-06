import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const VariantsSection = () => {
  return <div></div>;
};

const VarianceConfiguaration = ({ setGoToVarianceConfig }) => {
  const {
    register,
    reset,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      applyTax: false,
    },
  });

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);

  console.log(productWithVariants);

  return (
    <>
      <h1>Setup Products</h1>
      <div className="flex w-full h-full">
        <div className="w-full pb-6 pt-12 px-4">
          <div>
            <h1>Variance Configuration</h1>
            <p>Configure your variance, add price and quantity</p>
            <hr />
          </div>

          {/* AddVariants Section */}
          <div className="border border-red-500" style={{ height: 500 }}></div>
          {/* AddVariants Section */}

          {/* Buttons */}
          <div className="flex justify-end items-center w-full mt-2">
            <div>
              <button
                className="bg-black text-white px-4 py-2 rounded font-bold mr-2 focus:outline-none"
                onClick={() => {
                  setGoToVarianceConfig(false);
                }}
              >
                Back
              </button>
            </div>
            <div>
              <button className="bg-green-700 text-white px-4 py-2 rounded font-bold focus:outline-none">Create Product</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VarianceConfiguaration;

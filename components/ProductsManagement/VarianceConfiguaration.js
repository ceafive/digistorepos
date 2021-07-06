import { capitalize, filter, map, split, trim } from "lodash";
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
          <div className="" style={{ height: 500 }}>
            <div className="flex mt-4">
              {productWithVariants?.variants?.map((variant, index) => {
                const variantValues = map(
                  filter(map(split(variant.values, ","), trim), (o) => Boolean(o)),
                  capitalize
                );

                console.log(variantValues);
                return (
                  <div key={variant?.name + index} className="w-full md:w-1/3 px-3 mb-6 md:mb-0 mt-2">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-state">
                      {variant.name}
                    </label>
                    <div className="relative">
                      <select
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-state"
                      >
                        {/* <option value="">{"Select"}</option> */}
                        {variantValues.map((variantValue) => (
                          <option key={variantValue}>{variantValue}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
              <div className="mt-8">
                <button className="text-white font-bold px-6 py-2 bg-green-500 rounded shadow mx-4">Add</button>
              </div>
            </div>
          </div>
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

import { capitalize, filter, map, split, trim } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

const VariantsSection = () => {
  return <div></div>;
};

const VarianceConfiguaration = ({ setGoToVarianceConfig }) => {
  const {
    control,
    register,
    reset,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({});

  const {
    control: submitFormControl,
    register: submitFormRegister,
    reset: submitFormReset,
    watch: submitFormWatch,
    formState: { errors: submitFormErrors },
    handleSubmit: submitFormHandleSubmit,
  } = useForm({});

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "addVariant",
  // });

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const [varianceDistribution, setVarianceDistribution] = React.useState({});

  const addVariantRow = (values) => {
    // console.log({ values });
    try {
      setVarianceDistribution((varianceData) => ({ ...varianceData, [uuidv4()]: { ...values, Quantity: "", Price: "" } }));
    } catch (error) {
      console.log(error);
    }
  };

  const allVarianceDistribution = Object.entries(varianceDistribution);
  // console.log(varianceDistribution);
  // console.log(allVarianceDistribution);

  const handleCreateProduct = async () => {
    try {
      let noError = true;
      let noErrorID = "";
      // const res = Object.entries(varianceDistribution);
      // console.log(varianceDistribution);
      // console.log(res);

      for (const [key, value] of Object.entries(varianceDistribution)) {
        for (const valueOfValue of Object.values(value)) {
          console.log({ key, valueOfValue });
          if (!valueOfValue) {
            noError = false;
            noErrorID = key;
          }
        }
      }

      console.log({ noError, noErrorID });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="px-4">
      <h1>Setup Products</h1>
      <div className="flex w-full h-full">
        <div className="w-full pb-6 pt-6">
          <div>
            <h1 className="text-blue-700 font-bold">Variance Configuration</h1>
            <p className="text-gray-500">Configure your variance, add price and quantity</p>
            <hr />
          </div>

          {/* AddVariants Section */}
          <div className="overflow-scroll" style={{ height: 500 }}>
            <div className={`grid grid-cols-${productWithVariants?.variants.length + 1} gap-3 my-2`}>
              {productWithVariants?.variants?.map((variant, index) => {
                const variantValues = map(
                  filter(map(split(variant?.values, ","), trim), (o) => Boolean(o)),
                  capitalize
                );
                const capitalizeName = capitalize(variant?.name);

                return (
                  <div key={capitalizeName + index} className="mb-6 mt-2">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">{capitalizeName}</label>
                    <div className="">
                      <select
                        {...register(capitalizeName, { required: `${capitalizeName} is required` })}
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 rounded leading-tight focus:outline-none focus:bg-white"
                      >
                        <option value="">{`Select ${capitalizeName}`}</option>
                        {variantValues.map((variantValue) => (
                          <option key={variantValue} value={variantValue}>
                            {variantValue}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-red-500">{errors[capitalizeName]?.message}</p>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8">
                <button
                  className="text-white font-bold px-6 py-2 bg-green-500 rounded shadow mx-4"
                  onClick={() => {
                    handleSubmit(addVariantRow)();
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Variance Distribution */}
            {allVarianceDistribution?.length > 0 && (
              <div className="mt-4">
                <div className={`grid grid-cols-${productWithVariants?.variants?.length + 3} gap-3`}>
                  {productWithVariants?.variants?.map((variant) => {
                    const capitalizeName = capitalize(variant?.name);
                    return (
                      <h1 key={capitalizeName} className="font-bold text-blue-700 self-center">
                        {capitalizeName}
                      </h1>
                    );
                  })}
                  <h1 className="font-bold text-blue-700 self-center">Quantity</h1>
                  <h1 className="font-bold text-blue-700 self-center">Price</h1>
                  <h1 className="font-bold text-blue-700 self-center">Actions</h1>
                </div>

                <div className="my-2">
                  {allVarianceDistribution.map((variance, index) => {
                    // console.log(variance[0]);
                    const formattedVarianceEntries = Object.entries(variance[1]);
                    return (
                      <div key={index} className={`grid grid-cols-${formattedVarianceEntries.length + 1} gap-3 my-2`}>
                        {formattedVarianceEntries.map(([key, value], index) => {
                          if (key === "Quantity" || key === "Price") {
                            return (
                              <div key={key} className="self-center ">
                                <input
                                  type="number"
                                  value={varianceDistribution[variance[0]][key] ?? ""}
                                  onChange={(e) => {
                                    e.persist();
                                    setVarianceDistribution((values) => ({
                                      ...values,
                                      [variance[0]]: { ...values[variance[0]], [key]: e.target.value },
                                    }));
                                  }}
                                  placeholder="10"
                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                                />
                              </div>
                            );
                          } else {
                            return (
                              <h1 key={key} className="font-bold self-center  bg-gray-300 rounded pl-2 py-2">
                                {value}
                              </h1>
                            );
                          }
                        })}

                        <div
                          className="flex justify-center ittems-center font-bold bg-red-500 rounded py-1 cursor-pointer w-1/3"
                          onClick={() => {
                            console.log(index);
                          }}
                        >
                          <button className="focus:outline-none">
                            <i className="fas fa-trash-alt text-white"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Variance Distribution */}
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
              <button
                className="bg-green-700 text-white px-4 py-2 rounded font-bold focus:outline-none"
                onClick={() => {
                  handleCreateProduct();
                }}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VarianceConfiguaration;

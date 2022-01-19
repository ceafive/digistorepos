import axios from "axios";
import Spinner from "components/Spinner";
import { capitalize, filter, intersectionWith, isEqual, join, map, omit, split, trim } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { v4 as uuidv4 } from "uuid";

const VarianceConfiguaration = ({ setGoToVarianceConfig }) => {
  const router = useRouter();
  const { addToast } = useToasts();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({});

  const {
    formState: { errors: submitFormErrors },
    setError: submitFormSetError,
    clearErrors: submitFormClearErrors,
  } = useForm({});

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);

  // console.log(productWithVariants);

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [varianceDistribution, setVarianceDistribution] = React.useState({});

  const addVariantRow = (values) => {
    try {
      // console.log({ values });
      const copyObject = Object.assign({}, varianceDistribution);
      const objectValues = Object.values({ ...copyObject });

      const mappedValues = objectValues.map((objectValue) => {
        const newValue = { ...objectValue };
        delete newValue?.Quantity;
        delete newValue?.Price;
        delete newValue["QuantityUnlimited"];

        return newValue;
      });

      const res = intersectionWith(mappedValues, [values], isEqual);
      // console.log(mappedValues);
      // console.log(res);

      if (res.length > 0) {
        return addToast(`Variant already added`, { appearance: "error", autoDismiss: true });
      }

      setVarianceDistribution((varianceData) => ({
        ...varianceData,
        [uuidv4()]: { ...values, Quantity: "", QuantityUnlimited: false, Price: "" },
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const allVarianceDistribution = Object.entries(varianceDistribution);
  // console.log(Object.values(varianceDistribution));
  // console.log(varianceDistribution);
  // console.log(allVarianceDistribution);

  const handleCreateProduct = async () => {
    try {
      setIsProcessing(true);
      submitFormClearErrors();
      const errorObjects = [];

      for (const [key, value] of Object.entries(varianceDistribution)) {
        for (const [keyOfKey, valueOfValue] of Object.entries(value)) {
          // console.log(keyOfKey);
          // console.log({ keyOfKey, valueOfValue });

          if (keyOfKey !== "QuantityUnlimited") {
            if (!valueOfValue) {
              errorObjects.push({
                error: true,
                errorID: key,
                errorKey: keyOfKey,
              });
            }
          }
        }
      }

      errorObjects.forEach((errorObject) => {
        submitFormSetError(errorObject?.errorID, {
          type: "manual",
          message: `${errorObject?.errorKey} is required`,
          errorID: errorObject?.errorID,
          errorKey: errorObject?.errorKey,
        });
      });

      // console.log({ errorObjects });

      if (errorObjects.length === 0) {
        let propertyListIndexIncrease = -1;
        let variantOptionsIndexIncrease = -1;

        const property_list = productWithVariants?.variants?.reduce((acc, val) => {
          const values = Object.values(val);
          const variantName = capitalize(values[0]);
          const variantsStringArray = map(
            filter(map(split(values[1], ","), trim), (o) => Boolean(o)),
            capitalize
          );

          const entries = variantsStringArray.reduce((acc, value) => {
            propertyListIndexIncrease += 1;
            return {
              ...acc,
              [propertyListIndexIncrease]: {
                propertyId: variantName,
                propertyValue: value,
                propertyPriceSet: "NO",
                propertyPrice: "0",
              },
            };
          }, {});

          return {
            ...acc,
            ...entries,
          };
        }, {});

        const varianceDistributionValues = Object.values(varianceDistribution);

        // console.log({ varianceDistributionValues });
        const variants_options = varianceDistributionValues?.reduce((acc, val) => {
          variantOptionsIndexIncrease += 1;
          const newVal = { ...val };
          delete newVal?.Price;
          delete newVal?.Quantity;
          delete newVal["QuantityUnlimited"];

          const values = Object.entries(newVal);

          const optionValues = values.reduce((acc, optionValue) => {
            return {
              ...acc,
              [optionValue[0]]: optionValue[1],
            };
          }, {});
          // console.log(values);
          // console.log(optionValues);

          return {
            ...acc,
            [variantOptionsIndexIncrease]: {
              variantOptionValue: optionValues,
              variantOptionPrice: val?.Price,
              variantOptionQuantity: val["QuantityUnlimited"] ? "-99" : val?.Quantity,
              variantOptionBookingSlot: "-99",
            },
          };
        }, {});

        const {
          productName,
          productCategory,
          productDescription,
          sku,
          outlets,
          weight,
          barcode,
          sellingPrice,
          costPerItem,
          productImages,
          inventoryQuantity,
          setInventoryQuantity,
          applyTax,
        } = productWithVariants;

        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);
        const imagesToUpload = productImages?.map((productImage) => productImage?.file) ?? [];

        const formData = new FormData();
        formData.append("image", imagesToUpload[0]);

        const payload = {
          name: productName,
          desc: productDescription,
          price: parseFloat(sellingPrice),
          cost: costPerItem ? parseFloat(costPerItem) : "",
          quantity: setInventoryQuantity ? parseInt(inventoryQuantity) : -99,
          category: productCategory,
          tag: "NORMAL",
          taxable: applyTax ? "YES" : "NO",
          sku,
          weight: weight ? parseFloat(weight) : "",
          barcode,
          is_price_global: "YES",
          outlet_list: JSON.stringify(outlets),
          property_list: JSON.stringify(property_list),
          variants_options: varianceDistributionValues.length > 0 ? JSON.stringify(variants_options) : JSON.stringify({ 0: {} }),
          merchant: user["user_merchant_id"],
          mod_by: user["login"],
        };

        // console.log(payload);
        // return;

        const addProductRes = await axios.post("/api/products/create-product", { data: payload });

        const response = await addProductRes.data;
        // console.log(response);

        if (Number(response?.status) === 0) {
          addToast(response?.message, { appearance: "success", autoDismiss: true });

          router.push("/products/manage");
        } else {
          addToast(`${response?.message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
          setIsProcessing(false);
        }
      } else {
        addToast("Please fix errors", { appearance: "error", autoDismiss: true });
        setIsProcessing(false);
      }
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
    }
  };

  // console.log(submitFormErrors);

  const handleQuantityUnlimited = (e, variance) => {
    if (e.target.checked) {
      setVarianceDistribution((values) => ({
        ...values,
        [variance[0]]: { ...values[variance[0]], ["Quantity"]: "Unlimited", ["QuantityUnlimited"]: true },
      }));
    } else {
      setVarianceDistribution((values) => ({
        ...values,
        [variance[0]]: { ...values[variance[0]], ["Quantity"]: "", ["QuantityUnlimited"]: false },
      }));
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
          <div className="overflow-scroll" style={{ height: 600 }}>
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
                        <option value="" disabled>{`Select ${capitalizeName}`}</option>
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
                <div className={`grid grid-cols-${productWithVariants?.variants?.length + 4} gap-3`}>
                  {productWithVariants?.variants?.map((variant) => {
                    const capitalizeName = capitalize(variant?.name);
                    return (
                      <h1 key={capitalizeName} className="font-bold text-blue-700 self-center">
                        {capitalizeName}
                      </h1>
                    );
                  })}
                  <h1 className="font-bold text-blue-700 self-center">Quantity</h1>
                  <h1 className="font-bold text-blue-700 self-center">Quantity Unlimited</h1>
                  <h1 className="font-bold text-blue-700 self-center">Price</h1>
                  <h1 className="font-bold text-blue-700 self-center">Actions</h1>
                </div>

                <div className="my-2">
                  {allVarianceDistribution.map((variance) => {
                    const formattedVarianceKey = variance[0];
                    const formattedVarianceEntries = Object.entries(variance[1]);
                    const errorObject = submitFormErrors[formattedVarianceKey];

                    return (
                      <div key={variance[0]} className={`grid grid-cols-${formattedVarianceEntries.length + 1} gap-3 my-2`}>
                        {formattedVarianceEntries.map(([key, value]) => {
                          if (key === "Quantity" || key === "Price") {
                            return (
                              <div key={key} className="self-center ">
                                <input
                                  disabled={key === "Quantity" && value === "Unlimited" ? true : false}
                                  type={key === "Quantity" && value === "Unlimited" ? "text" : "number"}
                                  min="1"
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
                                {errorObject?.errorID === formattedVarianceKey && key === errorObject?.errorKey && (
                                  <p className="text-xs text-red-500">{errorObject?.message}</p>
                                )}
                              </div>
                            );
                          } else if (key === "QuantityUnlimited") {
                            return (
                              <div key={key} className="flex self-center">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => {
                                    handleQuantityUnlimited(e, variance); // your method
                                  }}
                                />

                                <label className="text-xs ml-1">Unlimited</label>
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
                            const result = omit(varianceDistribution, [formattedVarianceKey]);
                            setVarianceDistribution(result);
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
                className="bg-black text-white px-6 py-3 rounded font-bold mr-2 focus:outline-none"
                onClick={() => {
                  setGoToVarianceConfig(false);
                }}
              >
                Back
              </button>
            </div>
            <div className="">
              <button
                className={`${
                  isProcessing ? "bg-gray-300 text-gray-200" : "bg-green-800  text-white"
                }  px-6 py-3 w-full rounded font-semibold focus:outline-none`}
                onClick={() => {
                  handleCreateProduct();
                }}
              >
                {isProcessing && (
                  <div className="inline-block mr-2">
                    <Spinner type={"TailSpin"} color="black" width={10} height={10} />
                  </div>
                )}
                <span> Create Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VarianceConfiguaration;

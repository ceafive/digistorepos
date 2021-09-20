import axios from "axios";
import Spinner from "components/Spinner";
import { setProductWithVariants } from "features/manageproducts/manageprodcutsSlice";
import { capitalize, filter, forEach, fromPairs, intersectionWith, isEmpty, isEqual, join, map, mapValues, omit, sortBy, split, trim } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { v4 as uuidv4 } from "uuid";

const EditProductVariance = ({ setGoToVarianceConfig, setRefetch }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { addToast, removeToast } = useToasts();
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
  // console.log({ productWithVariants });

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [varianceDistribution, setVarianceDistribution] = React.useState({});

  const addVariantRow = (values) => {
    try {
      const copyObject = Object.assign({}, varianceDistribution);
      const objectValues = Object.values({ ...copyObject });

      const mappedValues = objectValues.map((objectValue) => {
        const newValue = { ...objectValue };
        delete newValue?.Quantity;
        delete newValue?.Price;
        delete newValue?.variantOptionId;
        delete newValue["QuantityUnlimited"];

        return newValue;
      });

      const res = intersectionWith(mappedValues, [values], isEqual);
      // console.log(mappedValues);
      // console.log(res);

      if (res.length > 0) {
        return addToast(`Variant already added`, { appearance: "error", autoDismiss: true });
      }

      setVarianceDistribution((varianceData) => ({ ...varianceData, [uuidv4()]: { ...values, Price: "", Quantity: "", QuantityUnlimited: false } }));
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    const values = productWithVariants?.variantsDistribution?.reduce((acc, variantDistribution) => {
      // console.log(variantDistribution);
      const data = {
        Quantity: variantDistribution?.variantOptionQuantity,
        QuantityUnlimited: variantDistribution?.variantOptionQuantity === "-99" ? true : false,
        Price: variantDistribution?.variantOptionPrice,
        ...variantDistribution?.variantOptionValue,
      };

      if (variantDistribution?.variantOptionId) {
        data[`variantOptionId`] = variantDistribution?.variantOptionId;
      }

      return {
        ...acc,
        [uuidv4()]: data,
      };
    }, {});

    setVarianceDistribution((varianceData) => ({ ...varianceData, ...values }));
  }, []);

  const allVarianceDistribution = Object.entries(varianceDistribution);
  // console.log({ varianceDistribution });
  // console.log(allVarianceDistribution);

  const handleUpdateProduct = async () => {
    try {
      setIsProcessing(true);
      submitFormClearErrors();
      const errorObjects = [];

      if (isEmpty(varianceDistribution)) {
        return addToast("At least one variance must be added!", { appearance: "error", autoDismiss: true });
      }

      for (const [key, value] of Object.entries(varianceDistribution)) {
        for (const [keyOfKey, valueOfValue] of Object.entries(value)) {
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

          const entries = variantsStringArray.reduce((acc, value, index) => {
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

        const sortByKeys = (object) => {
          const sortedNewValues = {};
          Object.keys(object)
            .sort()
            .forEach(function (v, i) {
              sortedNewValues[v] = object[v];
            });
          return sortedNewValues;
        };

        const sortObject = (object) => {
          const newDistribution = {};
          forEach(object, (v, k) => {
            newDistribution[k] = sortByKeys(v);
          });

          return newDistribution;
        };

        const varianceDistributionValues = Object.values(sortObject(varianceDistribution));
        const variants_options = varianceDistributionValues?.reduce((acc, val) => {
          variantOptionsIndexIncrease += 1;
          const newVal = { ...val };
          delete newVal?.Price;
          delete newVal?.Quantity;
          delete newVal?.variantOptionId;
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

          const data = {
            variantOptionValue: optionValues,
            variantOptionPrice: val?.Price,
            variantOptionQuantity: val["QuantityUnlimited"] ? "-99" : val?.Quantity,
          };

          if (val?.variantOptionId) {
            data[`variantOptionId`] = val?.variantOptionId;
          }

          return {
            ...acc,
            [variantOptionsIndexIncrease]: data,
          };
        }, {});

        const {
          id,
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
          old_outlet_list,
          applyTax,
          addVariants,
        } = productWithVariants;

        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);
        const imagesToUpload = productImages?.map((productImage) => productImage) ?? [];

        const payload = {
          id,
          name: productName,
          desc: productDescription,
          price: parseFloat(sellingPrice),
          cost: costPerItem ? parseFloat(costPerItem) : "",
          quantity: setInventoryQuantity ? parseInt(inventoryQuantity) : -99,
          category: productCategory || "Test",
          tag: "NORMAL",
          taxable: applyTax ? "YES" : "NO",
          sku,
          weight: weight ? parseFloat(weight) : "",
          barcode,
          is_price_global: "YES",
          old_outlet_list,
          // outlet_list: outlets,
          outlet_list: JSON.stringify(outlets),
          merchant: user["user_merchant_id"],
          mod_by: user["login"],
          // property_list: JSON.stringify(property_list),
          // variants_options: JSON.stringify(variants_options),
          variants_options: variants_options,
          property_list: property_list,
        };

        const dataToSendBack = {
          ...productWithVariants,
          variantsDistribution: Object.values(payload?.variants_options),
        };

        if (typeof imagesToUpload[0] !== "string" && typeof imagesToUpload[0] !== "undefined") {
          payload["image"] = {
            dataURL: imagesToUpload[0].data_url,
            name: imagesToUpload[0].file.name,
            // contentType: imagesToUpload[0].file.type,
            // fileExtension: imagesToUpload[0].file.type.split("/")[1],
          };
        }

        // console.log({ payload });
        // console.log({ dataToSendBack });
        // return;

        dispatch(setProductWithVariants(dataToSendBack));
        setGoToVarianceConfig(false);

        return;
        const updateProductRes = await axios.post("/api/products/update-product", {
          data: payload,
        });

        const response = await updateProductRes.data;
        // console.log(response);

        if (Number(response?.status) === 0) {
          addToast(response?.message, { appearance: "success", autoDismiss: true });
          // router.push("/products/manage");
          // setRefetch(new Date());
          setGoToVarianceConfig(false);
        } else {
          addToast(`${response?.message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
        }
      } else {
        addToast("Please fix errors", { appearance: "error", autoDismiss: true });
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      console.log(errorResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteVariant = async (variantOptionId, formattedVarianceKey) => {
    try {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const r = window.confirm("Are you sure you want to delete variant option?");
      if (r === true) {
        addToast(`Deleting Variant...`, { appearance: "info", autoDismiss: true, id: "delete-variant" });
        const data = {
          variant: variantOptionId,
          product: productWithVariants?.id,
          merchant: user?.user_merchant_id,
          mod_by: user?.login,
        };

        // console.log({ data });

        const deleteVariantRes = await axios.post("/api/products/delete-product-variant", { data });
        const { status, message } = await deleteVariantRes.data;

        // console.log({ status, message });

        removeToast(`delete-variant`);

        if (Number(status) === 0) {
          addToast(message, { appearance: "success", autoDismiss: true });
          const result = omit(varianceDistribution, [formattedVarianceKey]);
          setVarianceDistribution(result);
        } else {
          addToast(message, { appearance: "error", autoDismiss: true });
        }
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
        console.log(errorResponse);
      }
    }
  };

  // return null;

  const handleQuantityUnlimited = (e, variance) => {
    if (e.target.checked) {
      setVarianceDistribution((values) => ({
        ...values,
        [variance[0]]: { ...values[variance[0]], ["Quantity"]: "-99", ["QuantityUnlimited"]: true },
      }));
    } else {
      setVarianceDistribution((values) => ({
        ...values,
        [variance[0]]: { ...values[variance[0]], ["Quantity"]: "", ["QuantityUnlimited"]: false },
      }));
    }
  };

  return (
    <div className="px-4 pb-6 pt-6">
      <h1>Setup Product Variant Permutations</h1>
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
              {sortBy(productWithVariants?.variants, ["name"])?.map((variant, index) => {
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
                      <p className="text-xs text-red-500 mt-2">{errors[capitalizeName]?.message}</p>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8">
                <button className="text-white font-bold px-6 py-2 bg-green-500 rounded shadow mx-4" onClick={handleSubmit(addVariantRow)}>
                  Add
                </button>
              </div>
            </div>

            {/* Variance Distribution */}
            {allVarianceDistribution?.length > 0 && (
              <div className="mt-4">
                <div className={`grid grid-cols-${productWithVariants?.variants?.length + 4} gap-3`}>
                  {sortBy(productWithVariants?.variants, ["name"])?.map((variant) => {
                    const capitalizeName = capitalize(variant?.name);
                    return (
                      <div key={capitalizeName} className="self-center">
                        <h1 key={capitalizeName} className="font-bold text-blue-700 self-center">
                          {capitalizeName}
                        </h1>
                      </div>
                    );
                  })}
                  <div className="self-center">
                    <h1 className="font-bold text-blue-700 self-center">Price</h1>
                  </div>
                  <div className="self-center">
                    <h1 className="font-bold text-blue-700 self-center">Quantity</h1>
                  </div>
                  <div className="self-center">
                    <h1 className="font-bold text-blue-700 self-center">Quantity Unlimited</h1>
                  </div>
                  <div className="self-center">
                    <h1 className="font-bold text-blue-700 self-center">Actions</h1>
                  </div>
                </div>

                <div className="my-2">
                  {allVarianceDistribution.map((variance) => {
                    const formattedVarianceKey = variance[0];
                    const errorObject = submitFormErrors[formattedVarianceKey];

                    const oldValue = { ...variance[1] };
                    const newValue = { ...variance[1] };

                    const variantOptionId = oldValue?.variantOptionId;
                    variantOptionId && delete newValue["variantOptionId"];

                    const sortedNewValues = {};
                    Object.keys(newValue)
                      .sort()
                      .forEach(function (v, i) {
                        sortedNewValues[v] = newValue[v];
                      });

                    // console.log({ newValue });
                    // console.log({ sortedNewValues });

                    const formattedVarianceEntries = Object.entries(sortedNewValues);

                    const removeKeys = formattedVarianceEntries.filter(([key]) => {
                      if (key === "Quantity" || key === "Price" || key === "QuantityUnlimited") return false;
                      else return true;
                    });

                    // console.log({ removeKeys });

                    const removePriceAndQuantty = formattedVarianceEntries.filter(([key]) => {
                      if (key === "Quantity" || key === "Price") return true;
                      else return false;
                    });

                    const removeQuantityUnlimited = formattedVarianceEntries.filter(([key]) => {
                      if (key === "QuantityUnlimited") return true;
                      else return false;
                    });

                    return (
                      <div key={variance[0]} className={`grid grid-cols-${formattedVarianceEntries.length + 1} gap-3 my-2`}>
                        {removeKeys.map(([key, value]) => {
                          return (
                            <h1 key={key} className="font-bold self-center  bg-gray-300 rounded pl-2 py-2">
                              {value}
                            </h1>
                          );
                        })}

                        {removePriceAndQuantty.map(([key, value]) => {
                          return (
                            <div key={key} className="self-center ">
                              <input
                                disabled={key === "Quantity" && value === "-99" ? true : false}
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
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                              />
                              {errorObject?.errorID === formattedVarianceKey && key === errorObject?.errorKey && (
                                <p className="text-xs text-red-500">{errorObject?.message}</p>
                              )}
                            </div>
                          );
                        })}

                        {removeQuantityUnlimited.map(([key, value]) => {
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
                        })}

                        <button
                          className="w-1/2 bg-red-500 rounded py-0 font-bold focus:outline-none"
                          onClick={async () => {
                            if (variantOptionId) {
                              await deleteVariant(variantOptionId, formattedVarianceKey);
                            } else {
                              const result = omit(varianceDistribution, [formattedVarianceKey]);
                              setVarianceDistribution(result);
                            }
                          }}
                        >
                          <i className="fas fa-trash-alt text-white"></i>
                        </button>
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
                  handleUpdateProduct();
                }}
              >
                {isProcessing && (
                  <div className="inline-block mr-2">
                    <Spinner type={"TailSpin"} color="black" width={10} height={10} />
                  </div>
                )}
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductVariance;

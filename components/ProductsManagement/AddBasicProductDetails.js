import { setProductHasVariants, setProductWithVariants } from "features/manageproducts/manageprodcutsSlice";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import UploadImage from "./UploadImage";

const VariantsSection = () => {
  return <div></div>;
};

const AddProductDetails = ({ setGoToVarianceConfig }) => {
  const dispatch = useDispatch();
  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const {
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      applyTax: false,
      ...productWithVariants,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const productHasVariants = useSelector((state) => state.manageproducts.productHasVariants);
  // console.log(productWithVariants);

  const createProduct = (values) => {
    try {
      console.log(values);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (productHasVariants) append({});
    else remove();
    return () => {};
  }, [productHasVariants]);

  const createProductWithVariants = (values) => {
    try {
      dispatch(setProductWithVariants(values));
      setGoToVarianceConfig(true);
    } catch (error) {
      console.log(error);
    }
  };

  // console.log({ variantsArray });

  const buttonParams = React.useMemo(() => {
    switch (productHasVariants) {
      case true:
        return {
          buttonText: "Proceed",
          buttonAction: handleSubmit(createProductWithVariants),
        };

      case false:
        return {
          buttonText: "Create Product",
          buttonAction: handleSubmit(createProduct),
        };
    }
  }, [productHasVariants]);

  // console.log(buttonParams);

  return (
    <>
      <h1>Setup Products</h1>
      <div className="flex w-full h-full">
        <div className="w-7/12 xl:w-8/12 pb-6 pt-12 px-4">
          <div>
            <h1>Product Details</h1>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Product Name</label>
                <input
                  {...register("productName", { required: "Product name is required" })}
                  type="text"
                  placeholder="Apricot"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["productName"]?.message}</p>
              </div>

              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">Product Category</label>
                <input
                  {...register("productCategory", { required: "Product category is required" })}
                  type="text"
                  placeholder="Pizza"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["productCategory"]?.message}</p>
              </div>
            </div>
            <div className="w-full mr-2">
              <label className="text-sm leading-none  font-bold">Description (Optional)</label>
              <textarea
                {...register("productDescription", { required: false })}
                type="text"
                rows={4}
                placeholder="A short description of the product"
                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
              />
            </div>
          </div>

          <div>
            <h1>Pricing</h1>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Selling Price</label>
                <input
                  {...register("sellingPrice", { required: "Selling price is required" })}
                  type="number"
                  placeholder="12"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["sellingPrice"]?.message}</p>
              </div>

              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">
                  Cost Per Item <span className="text-xs">(Your customers won't see this)</span>
                </label>
                <input
                  {...register("costPerItem")}
                  type="number"
                  placeholder="Enter cost of product"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["costPerItem"]?.message}</p>
              </div>
            </div>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Inventory</label>
                <div className="flex items-center w-full mb-1">
                  <input
                    {...register("inventoryQuantity", { required: "Quantity is required" })}
                    type="checkbox"
                    className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                  />
                  <label className="text-sm leading-none  font-bold">Set number of units in stock</label>
                </div>
                <input
                  {...register("inventoryQuantity", { required: "Quantity is required" })}
                  type="number"
                  placeholder="Quantity in stock"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["inventoryQuantity"]?.message}</p>
              </div>

              <div className="w-1/2 mt-6">
                <label className="text-sm leading-none  font-bold">SKU (Stock Keeping Unit)</label>
                <input
                  {...register("sku")}
                  type="text"
                  placeholder=""
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["sku"]?.message}</p>
              </div>
            </div>

            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Barcode (ISBN,UPC,GTIN, etc)</label>
                <input
                  {...register("barcode")}
                  type="text"
                  placeholder="Click and scan product barcode in here"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["barcode"]?.message}</p>
              </div>

              <div className="w-1/2">
                <label className="text-xs leading-none font-bold">
                  Weight of the item in Kilograms <span className="text-xs">(Used to calculate shipping rates at checkout)</span>
                </label>
                <input
                  {...register("weight", { required: "Weight is required" })}
                  type="number"
                  placeholder=""
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                />
                <p className="text-xs text-red-500">{errors["weight"]?.message}</p>
              </div>
            </div>
            <div className="w-full mr-2">
              <input
                {...register("applyTax")}
                type="checkbox"
                className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
              />

              <label className="text-sm leading-none  font-bold">Apply tax on this product</label>
            </div>

            {/* Variants */}
            <div className="w-full mr-2 mt-2 bg-gray-200 p-6 rounded">
              <div className="flex justify-between items-center w-full">
                <h1 className="font-bold text-blue-700">Does your product have variants?</h1>
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    dispatch(setProductHasVariants());
                  }}
                >
                  <div
                    className={`${
                      productHasVariants && "bg-green-400"
                    } w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out`}
                  >
                    <div
                      className={`${
                        productHasVariants && "translate-x-4"
                      } bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out`}
                    />
                  </div>
                </div>
              </div>
              <h1>Multiple options of the same product which customers can choose from</h1>
              <hr className="text-blue-500 bg-blue-500" />
              {productHasVariants && (
                <div className="mt-2">
                  <div className="flex flex-wrap justify-center items-center w-full">
                    {fields.map(({ id }, index) => {
                      const name =
                        (productWithVariants?.variants ?? [])?.find((variant, variantIndex) => variantIndex === index)?.name ?? "";
                      const values =
                        (productWithVariants?.variants ?? [])?.find((variant, variantIndex) => variantIndex === index)?.values ?? "";

                      // console.log({ name, values });
                      return (
                        <div key={id} className="w-full my-3">
                          <div key={id} className="flex w-full justify-between items-center">
                            <div className=" mr-2">
                              <label className="text-xs leading-none font-bold">Variant Name</label>
                              <input
                                {...register(`variants[${index}].name`, {
                                  validate: (value) => (productHasVariants ? Boolean(value) : true) || "Variant must be entered",
                                })}
                                defaultValue={name}
                                type="text"
                                placeholder="eg. Size"
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                              />
                              {/* <p className="text-xs text-red-500">{errors["weight"]?.message}</p> */}
                            </div>

                            <div className="">
                              <label className="text-xs leading-none font-bold">
                                Variant Values <span className="text-xs">(Separated by comma ",")</span>
                              </label>
                              <input
                                {...register(`variants[${index}].values`)}
                                defaultValue={values}
                                type="text"
                                placeholder="eg. Small,Medium,Large"
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
                              />
                              {/* <p className="text-xs text-red-500">{errors["weight"]?.message}</p> */}
                            </div>

                            <div className="w-1/5 flex">
                              {fields.length > 1 && (
                                <div
                                  className="font-bold bg-red-500 rounded h-full py-1 px-4 ml-4 mt-6 cursor-pointer"
                                  onClick={() => {
                                    remove(index);
                                  }}
                                >
                                  <button className="justify-self-end focus:outline-none">
                                    <i className="fas fa-trash-alt text-white"></i>
                                  </button>
                                </div>
                              )}

                              {fields?.length < 5 && index === fields.length - 1 && (
                                <div
                                  className="font-bold bg-green-500 rounded h-full py-1 px-4 ml-2 mt-6 cursor-pointer"
                                  onClick={() => {
                                    append({});
                                  }}
                                >
                                  <button className="justify-self-end focus:outline-none">
                                    <i className="fas fa-plus text-white"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <hr />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Variants */}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-5/12 xl:w-4/12 pb-6 pt-12 px-4">
          <div className="bg-gray-300 p-2 pt-0 rounded">
            <h1>Product Gallery</h1>
            <hr />
            <p className="my-2 text-sm">Upload product images, max of 4 images (Optional)</p>
            <p className="mt-2 text-sm font-bold text-red-500">Minimum Size: 800x800</p>

            <div className="bg-white m-2" style={{ height: 200 }}>
              <div className="flex flex-col justify-center items-center border border-gray-200 h-full w-full">
                {/* <h1 className="">Drag &amp; drop files here or click to add files</h1> */}
                <UploadImage classes="" setValue={setValue} />
              </div>
            </div>
          </div>
          <div className="bg-gray-300 p-2 pt-0 rounded mt-4">
            <h1>Outlets</h1>
            <hr />
            <p className="my-2 text-sm">Add products to outlets (You can select multiple outlets)</p>

            <div className="bg-white m-2 p-2" style={{ height: 200 }}>
              <div className="w-full mr-2">
                <input
                  {...register("haatso", { required: true })}
                  type="checkbox"
                  className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                />
                <label className="text-sm leading-none  font-bold">Haatso branch</label>
              </div>
              <div className="w-full mr-2">
                <input
                  {...register("storage", { required: true })}
                  type="checkbox"
                  className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                />
                <label className="text-sm leading-none  font-bold">Storage</label>
              </div>
            </div>
          </div>

          <div className="w-full mt-2">
            <button
              className="bg-green-600 px-6 py-3 w-full rounded text-white font-semibold uppercase"
              onClick={() => {
                buttonParams.buttonAction();
              }}
            >
              {buttonParams.buttonText}
            </button>
          </div>
        </div>
        {/* Right Side */}
      </div>
    </>
  );
};

export default AddProductDetails;

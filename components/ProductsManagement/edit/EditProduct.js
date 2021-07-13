import axios from "axios";
import ButtonSpinner from "components/ButtonSpinner";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import {
  setManageProductCategories,
  setProductHasVariants,
  setProductWithVariants,
  setShowAddCategoryModal,
} from "features/manageproducts/manageprodcutsSlice";
import { capitalize, filter, get, intersectionWith, isEmpty, isEqual, map } from "lodash";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import UploadImage from "../create/UploadImage";

const EditProduct = ({ product, setGoToVarianceConfig }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const productHasVariants = useSelector((state) => state.manageproducts.productHasVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);
  const showAddCategoryModal = useSelector((state) => state.manageproducts.showAddCategoryModal);

  const [fetching, setFetching] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [images, setImages] = React.useState(product?.product_images ?? []);

  //   console.log({ product });

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
      productName: product?.product_name,
      productDescription: product?.product_description,
      sellingPrice: product?.product_price,
      costPerItem: product?.product_unit_cost,
      inventoryQuantity: product?.product_quantity === "-99" ? 0 : product?.product_quantity,
      productCategory: manageProductCategories.find((category) => category?.product_category === product?.product_category)
        ?.product_category_id,
      tag: "NORMAL",
      sku: product?.product_sku,
      weight: product?.product_weight,
      barcode: product?.product_barcode,
      is_price_global: "YES",
      setInventoryQuantity: product?.product_quantity === "-99" ? false : true,
      //   outlets: JSON.stringify(outlets),
      applyTax: product?.product_taxed === "YES" ? true : false,
      outlets: [],
      productImages: [],
      variants: product?.product_properties
        ? Object.entries(product?.product_properties ?? {})?.map((product) => {
            return {
              name: capitalize(product[0]),
              values: product[1].map((value) => value?.property_value).join(","),
            };
          })
        : [],
    },
  });

  const {
    register: addCategoryRegister,
    reset: addCategoryReset,
    formState: { errors: addCategoryErrors },
    handleSubmit: addCategoryHandleSumbit,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const isInventorySet = watch("setInventoryQuantity", false);
  const productCategory = watch("productCategory", false);

  const createProduct = async (values) => {
    try {
      setIsProcessing(true);
      const data = { ...values, applyTax: get(values, "applyTax") ? "YES" : "NO" };
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
      } = data;

      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const imagesToUpload = productImages?.map((productImage) => productImage?.file) ?? [];

      const payload = {
        name: productName,
        desc: productDescription,
        price: parseFloat(sellingPrice),
        cost: costPerItem ? parseFloat(costPerItem) : "",
        quantity: setInventoryQuantity ? parseInt(inventoryQuantity) : -99,
        category: productCategory,
        tag: "NORMAL",
        taxable: applyTax,
        sku,
        weight: weight ? parseFloat(weight) : "",
        barcode,
        is_price_global: "YES",
        outlet_list: JSON.stringify(outlets),
        merchant: user["user_merchant_id"],
        mod_by: user["login"],
        // image: imagesToUpload[0],
      };

      const formData = new FormData();
      formData.append("image", imagesToUpload[0]);
      formData.append("name", payload?.name);
      formData.append("desc", payload?.desc);
      formData.append("price", payload?.price);
      formData.append("cost", payload?.cost);
      formData.append("quantity", payload?.quantity);
      formData.append("category", payload?.category);
      formData.append("tag", payload?.tag);
      formData.append("taxable", payload?.taxable);
      formData.append("sku", payload?.sku);
      formData.append("weight", payload?.weight);
      formData.append("barcode", payload?.barcode);
      formData.append("is_price_global", payload?.is_price_global);
      formData.append("outlet_list", payload?.outlet_list);
      formData.append("merchant", payload?.merchant);
      formData.append("mod_by", payload?.mod_by);

      console.log(payload);
      // console.log(imagesToUpload[0]);
      // console.log(formData.entries());

      // for (var pair of formData.entries()) {
      //   console.log(pair[0] + ", " + pair[1]);
      // }

      const addProductRes = await axios.post("/api/products/create-product", {
        data: payload,
        // config: {
        //   "Content-Type": "multipart/form-data",
        // },
      });
      const response = await addProductRes.data;
      console.log(response);

      if (Number(response?.status) === 0)
        reset({
          productName: "",
          productCategory: "",
          productDescription: "",
          sku: "",
          outlets: [],
          weight: "",
          barcode: "",
          sellingPrice: "",
          costPerItem: "",
          productImages: [],
          setInventoryQuantity: false,
          applyTax: false,
          inventoryQuantity: 0,
        });
      setImages([]);
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

  const createProductWithVariants = (values) => {
    try {
      //   console.log(product);
      //   return;
      dispatch(setProductWithVariants({ ...values, variantsDistribution: product?.product_properties_variants }));
      setGoToVarianceConfig(true);
    } catch (error) {
      console.log(error);
    }
  };

  const postNewCategory = async (values, user) => {
    const data = {
      name: values?.categoryName,
      desc: values?.categoryDescription,
      merchant: user?.user_merchant_id,
      mod_by: user?.login,
    };

    const response = await axios.post("/api/products/add-product-category", data);
    const { status, message } = await response.data;
    return { data, status, message };
  };

  const getNewCategories = async (status, message, user) => {
    if (status === 0) {
      addCategoryReset({
        categoryName: "",
        categoryDescription: "",
      });

      const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
      const { data: allCategoriesResData } = await allCategoriesRes.data;
      const filtered = filter(allCategoriesResData, (o) => Boolean(o));
      dispatch(setManageProductCategories(filtered));
      return filtered;
    } else addToast(`${message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
  };

  const sumbitNewCategoryToServer = async (values) => {
    try {
      setProcessing(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const { data, status, message } = await postNewCategory(values, user);
      await getNewCategories(status, message, user, data).then((filtered) => {
        const found = filtered.find((o) => o?.product_category === data?.name);
        setValue("productCategory", found?.product_category_id ?? ""); // add new cateogry and select it
        addToast(message, { appearance: "success", autoDismiss: true });
        dispatch(setShowAddCategoryModal());
      });
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
      setProcessing(false);
    } finally {
      setProcessing(false);
    }
  };

  const buttonParams = React.useMemo(() => {
    switch (productHasVariants) {
      case true:
        return {
          buttonText: "Edit Variance",
          buttonAction: handleSubmit(createProductWithVariants),
        };

      case false:
        return {
          buttonText: "Save",
          buttonAction: handleSubmit(createProduct),
        };
    }
  }, [productHasVariants]);

  React.useEffect(() => {
    if (productCategory === "addNewCategory") {
      dispatch(setShowAddCategoryModal());
    }
  }, [productCategory]);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allOutletsRes = await axios.post("/api/products/get-product-outlets", { user, product_id: product?.product_id });
        const { data: allOutletsResData } = await allOutletsRes.data;
        const filtered = filter(allOutletsResData, (o) => Boolean(o));
        // console.log({ allOutletsResData });

        const response = intersectionWith(manageProductOutlets, filtered, (arrVal, othVal) => {
          return arrVal?.outlet_id === othVal?.outlet_id;
        });

        setValue(
          "outlets",
          map(response ?? [], (o) => o?.outlet_id)
        );

        !isEmpty(product?.product_properties) && dispatch(setProductHasVariants(true));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      <h1>Setup Products</h1>
      <div className="flex w-full h-full">
        <div className="w-7/12 xl:w-8/12 pb-6 pt-12 px-4">
          <div>
            <h1 className="font-bold text-blue-700">Product Details</h1>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Product Name</label>
                <input
                  {...register("productName", { required: "Product name is required" })}
                  type="text"
                  placeholder="Apricot"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                />
                <p className="text-xs text-red-500">{errors["productName"]?.message}</p>
              </div>

              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">Product Category</label>
                <select
                  {...register("productCategory", { required: "Product category is required" })}
                  className="block border-0 appearance-none w-full text-gray-700 py-2 rounded focus:outline-none text-sm bg-white mb-2"
                >
                  <option value="">{`Select Category`}</option>
                  {manageProductCategories?.map((category) => {
                    return (
                      <option key={category?.product_category_id} value={category?.product_category_id}>
                        {category?.product_category}
                      </option>
                    );
                  })}
                </select>
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
                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
              />
            </div>
          </div>

          <div>
            <h1 className="font-bold text-blue-700">Pricing</h1>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Selling Price</label>
                <input
                  {...register("sellingPrice", { required: "Selling price is required" })}
                  type="number"
                  placeholder="12"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
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
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                />
                <p className="text-xs text-red-500">{errors["costPerItem"]?.message}</p>
              </div>
            </div>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none font-bold">Inventory</label>
                <div className="flex items-center w-full mb-2">
                  <input
                    {...register("setInventoryQuantity")}
                    type="checkbox"
                    className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                  />
                  <label className="text-sm leading-none  font-bold">Set number of units in stock</label>
                </div>
                {isInventorySet && (
                  <>
                    <input
                      {...register("inventoryQuantity", {
                        validate: (value) => (isInventorySet ? Boolean(value) && Number(value) > 0 : true) || "Quantity is required",
                      })}
                      type="number"
                      placeholder="Quantity in stock"
                      className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                    />
                    <p className="text-xs text-red-500">{errors["inventoryQuantity"]?.message}</p>
                  </>
                )}
              </div>

              <div className="w-1/2 mt-6">
                <label className="text-sm leading-none  font-bold">SKU (Stock Keeping Unit)</label>
                <input
                  {...register("sku")}
                  type="text"
                  placeholder=""
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
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
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                />
                <p className="text-xs text-red-500">{errors["barcode"]?.message}</p>
              </div>

              <div className="w-1/2">
                <label className="text-xs leading-none font-bold">
                  Weight of the item in Kilograms <span className="text-xs">(Used to calculate shipping rates at checkout)</span>
                </label>
                <input
                  {...register("weight")}
                  type="number"
                  placeholder=""
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
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
                    {fields?.map(({ id, name, values }, index) => {
                      return (
                        <div key={id} className="w-full my-3">
                          <div key={id} className="flex w-full justify-between items-center">
                            <div className=" mr-2">
                              <label className="text-xs leading-none font-bold">Variant Name</label>
                              <input
                                {...register(`variants[${index}].name`, {
                                  validate: (value) => (productHasVariants ? Boolean(value) : true) || "Variant name must be entered",
                                })}
                                defaultValue={name}
                                type="text"
                                placeholder="eg. Size"
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                              />
                              {errors[`variants`] && errors[`variants`][index] && (
                                <p className="text-xs text-red-500">{errors[`variants`][index]?.name?.message}</p>
                              )}
                            </div>

                            <div className="">
                              <label className="text-xs leading-none font-bold">
                                Variant Values <span className="text-xs">(Separated by comma ",")</span>
                              </label>
                              <input
                                {...register(`variants[${index}].values`, {
                                  validate: (value) => (productHasVariants ? Boolean(value) : true) || "Variant values must be entered",
                                })}
                                defaultValue={values}
                                type="text"
                                placeholder="eg. Small,Medium,Large"
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                              />
                              {errors[`variants`] && errors[`variants`][index] && (
                                <p className="text-xs text-red-500">{errors[`variants`][index]?.values?.message}</p>
                              )}
                            </div>

                            <div id="add-variant-buttons" className="w-1/5 flex">
                              {fields.length > 1 && (
                                <div
                                  className="font-bold bg-red-500 rounded h-full py-1 px-4 ml-4 mt-4 cursor-pointer"
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
                                  className="font-bold bg-green-500 rounded h-full py-1 px-4 ml-2 mt-4 cursor-pointer"
                                  onClick={() => {
                                    append({});
                                  }}
                                >
                                  <button className="justify-self-end focus:outline-none">
                                    <i className="fas fa-plus text-white" />
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
          <div className="bg-gray-200 p-2 pt-0 rounded">
            <h1 className="font-bold">Product Gallery</h1>
            <hr className="border-gray-500" />
            <p className="my-2 text-sm font-bold text-gray-600">Upload product images, max of 4 images (Optional)</p>
            <p className="mt-2 text-sm font-bold text-red-500">Minimum Size: 800x800</p>

            <div className="bg-white m-2" style={{ height: 200 }}>
              <div className="flex flex-col justify-center items-center border border-gray-200 h-full w-full">
                <UploadImage classes="" setValue={setValue} images={images} setImages={setImages} />
              </div>
            </div>
          </div>

          <div className="bg-gray-200 p-2 pt-0 rounded mt-4">
            <h1 className="font-bold">Outlets</h1>
            <hr className="border-gray-500" />
            <p className="my-2 text-sm font-bold text-gray-600">
              Add products to outlets
              <span className="text-xs">(You can select multiple outlets)</span>
            </p>

            <div className="bg-white m-2 p-2 overflow-y-scroll overflow-x-hidden" style={{ height: 200 }}>
              {manageProductOutlets?.map((outlet) => {
                return (
                  <div key={outlet?.outlet_id} className="w-full">
                    <input
                      {...register("outlets", { required: "Outlet selection is required" })}
                      type="checkbox"
                      value={outlet?.outlet_id}
                      className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                    />
                    <label className="text-sm font-bold mt-2">{outlet?.outlet_name}</label>
                  </div>
                );
              })}
            </div>
            <p className="my-1 text-xs text-red-500">{errors?.outlets?.message}</p>
          </div>

          <div className="mt-4">
            <button
              className={`${
                isProcessing ? "bg-gray-300 text-gray-200" : "bg-green-800  text-white"
              }  px-6 py-3 w-full rounded font-semibold uppercase focus:outline-none`}
              onClick={() => {
                buttonParams.buttonAction();
              }}
            >
              {isProcessing && (
                <div className="inline-block mr-2">
                  <Spinner type={"TailSpin"} color="black" width={10} height={10} />
                </div>
              )}
              <span>{buttonParams.buttonText}</span>
            </button>
          </div>
        </div>
        {/* Right Side */}
      </div>
    </>
  );
};

export default EditProduct;

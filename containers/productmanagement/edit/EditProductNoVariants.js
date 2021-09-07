import axios from "axios";
import ButtonSpinner from "components/ButtonSpinner";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import {
  setManageProductCategories,
  setManageProductOutlets,
  setProductHasVariants,
  setProductWithVariants,
  setShowAddCategoryModal,
} from "features/manageproducts/manageprodcutsSlice";
import { capitalize, filter, find, get, has, intersectionWith, isEmpty, isEqual, map, split, trim } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import AddCategory from "../create/AddCategory";
import UploadImage from "../create/UploadImage";

const EditProductNoVariants = ({ setGoToVarianceConfig }) => {
  const { addToast, removeToast, updateToast } = useToasts();
  const dispatch = useDispatch();
  const router = useRouter();

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const productHasVariants = useSelector((state) => state.manageproducts.productHasVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);
  const showAddCategoryModal = useSelector((state) => state.manageproducts.showAddCategoryModal);

  const {
    control,
    register,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // console.log(productWithVariants);
  // console.log(productHasVariants);

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [showAddNewVariantName, setShowAddNewVariantName] = React.useState(false);
  const [showAddNewVariantValue, setShowAddNewVariantValue] = React.useState(false);
  const [variantClicked, setVariantClicked] = React.useState(null);
  const [images, setImages] = React.useState(productWithVariants?.productImages ?? []);

  const {
    register: addCategoryRegister,
    reset: addCategoryReset,
    formState: { errors: addCategoryErrors },
    handleSubmit: addCategoryHandleSumbit,
  } = useForm();

  const isInventorySet = watch("setInventoryQuantity", false);
  const productCategory = watch("productCategory", false);
  const allVariants = watch("variants", []);
  const maxNumber = 1;

  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

  const watchAddVariants = watch(`addVariants`, productHasVariants);

  const [fetching, setFetching] = React.useState(false);
  const [refetch, setRefetch] = React.useState(new Date());

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        let allCategories = manageProductCategories;
        let allOutlets = manageProductOutlets;

        if (manageProductCategories?.length === 0) {
          const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
          const { data: allCategoriesResData } = await allCategoriesRes.data;
          allCategories = filter(allCategoriesResData, (o) => Boolean(o));
          dispatch(setManageProductCategories(allCategories));
        }

        if (manageProductOutlets?.length === 0) {
          const allOutletsRes = await axios.post("/api/products/get-outlets", { user });
          const { data: allOutletsResData } = await allOutletsRes.data;
          allOutlets = filter(allOutletsResData, (o) => Boolean(o));
          dispatch(setManageProductOutlets(allOutlets));
        }

        const {
          data: { data: product },
        } = await axios.post(`/api/products/get-product-details`, { productID: router?.query?.product_id });

        const filteredOutlets = filter(product?.product_outlets ?? [], Boolean);
        const intersectedOutlets = intersectionWith(allOutlets, filteredOutlets, (arrVal, othVal) => arrVal?.outlet_id === othVal?.outlet_id);

        // merge props
        const initial = {
          id: product?.product_id,
          productName: product?.product_name,
          productDescription: product?.product_description,
          sellingPrice: product?.product_price,
          costPerItem: product?.product_unit_cost,
          inventoryQuantity: product?.product_quantity === "-99" ? "" : product?.product_quantity,
          productCategory: allCategories.find((category) => category?.product_category === product?.product_category)?.product_category_id,
          tag: "NORMAL",
          sku: product?.product_sku,
          weight: product?.product_weight,
          barcode: product?.product_barcode,
          is_price_global: "YES",
          setInventoryQuantity: product?.product_quantity === "-99" ? false : true,
          applyTax: product?.product_taxed === "YES" ? true : false,
          old_outlet_list: JSON.stringify(map(product?.product_outlets ?? [], (o) => o?.outlet_id)),
          outlets: map(intersectedOutlets ?? [], (o) => o?.outlet_id),
          productImages: product?.product_images?.map((image) => `https://payments.ipaygh.com/app/webroot/img/products/${image}`) ?? [],
          productImage: `https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}` ?? "",
          product_properties_variants: product?.product_properties_variants ?? [],
          product_properties: product?.product_properties
            ? Object.entries(product?.product_properties ?? {})?.map(([key, value]) => {
                return {
                  name: capitalize(key),
                  values: value.map((value) => value?.property_value).join(","),
                };
              })
            : [],
        };

        const valuesToDispatch = {
          id: initial?.id,
          applyTax: initial?.applyTax,
          barcode: initial?.barcode,
          costPerItem: initial?.costPerItem,
          inventoryQuantity: initial?.inventoryQuantity,
          is_price_global: initial?.is_price_global,
          outlets: initial?.outlets,
          old_outlet_list: initial?.old_outlet_list,
          productCategory: initial?.productCategory,
          productDescription: initial?.productDescription,
          productName: initial?.productName,
          productImage: initial?.productImage,
          productImages: initial?.productImages,
          sellingPrice: initial?.sellingPrice,
          setInventoryQuantity: initial?.setInventoryQuantity,
          sku: initial?.sku,
          tag: initial?.tag,
          variants: initial?.product_properties || [],
          variantsDistribution: initial?.product_properties_variants || [],
          weight: initial?.weight,
        };

        // console.log({ valuesToDispatch });
        // console.log(Object.entries(valuesToDispatch));

        // Object.entries(valuesToDispatch).forEach(([key, value]) => setValue(key, value));
        const hasVariants = valuesToDispatch?.variants && !isEmpty(valuesToDispatch?.variants);

        reset({ ...valuesToDispatch, addVariants: hasVariants });
        // {
        //   defaultValues: { ...productWithVariants, addVariants: productHasVariants },
        // }
        // console.log({ hasVariants });

        dispatch(setProductWithVariants(valuesToDispatch));
        dispatch(setProductHasVariants(!!hasVariants));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [refetch]);

  const updateProduct = async (values) => {
    try {
      setIsProcessing(true);
      addToast(`Updating Product....`, { id: "updating" });
      const data = { ...values, applyTax: get(values, "applyTax") ? "YES" : "NO" };
      const {
        id,
        productName,
        productCategory,
        productDescription,
        sku,
        outlets,
        old_outlet_list,
        weight,
        barcode,
        sellingPrice,
        costPerItem,
        productImages,
        inventoryQuantity,
        setInventoryQuantity,
        applyTax,
        variants,
        addVariants,
      } = data;

      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const imagesToUpload = productImages?.map((productImage) => productImage) ?? [];

      let propertyListIndexIncrease = -1;

      const property_list = variants?.reduce((acc, val) => {
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

      // return;

      const payload = {
        id,
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
        old_outlet_list,
        outlet_list: JSON.stringify(outlets),
        merchant: user["user_merchant_id"],
        mod_by: user["login"],
        property_delete_all: addVariants ? "NO" : "YES",
        property_list: addVariants ? JSON.stringify(property_list) : JSON.stringify({ 0: {} }),
        variants_options: JSON.stringify({ 0: {} }), // hack to delete property list when user deselect product has variants toggle
      };

      // console.log(imagesToUpload);
      if (typeof imagesToUpload[0] !== "string" && typeof imagesToUpload[0] !== "undefined") {
        payload["image"] = {
          dataURL: imagesToUpload[0].data_url,
          name: imagesToUpload[0].file.name,
          // contentType: imagesToUpload[0].file.type,
          // fileExtension: imagesToUpload[0].file.type.split("/")[1],
        };
      }

      // console.log({ payload });
      // return;

      const updateProductRes = await axios.post("/api/products/update-product", {
        data: payload,
      });

      const response = await updateProductRes.data;
      // console.log(response);

      if (Number(response?.status) === 0) {
        addToast(response?.message, { appearance: "success", autoDismiss: true });

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
          inventoryQuantity: "",
        });
        setImages([]);
        router.push("/products/manage");
      } else {
        addToast(`${response?.message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
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
      // addToast(errorResponse, { appearance: `error`, autoDismiss: true });
      console.log(errorResponse);
    } finally {
      removeToast(`updating`);
      setIsProcessing(false);
    }
  };

  const sumbitNewCategoryToServer = async (values) => {
    try {
      setProcessing(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const data = {
        name: values?.categoryName,
        desc: values?.categoryDescription,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      const response = await axios.post("/api/products/add-product-category", data);
      const { status, message } = await response.data;

      if (status === 0) {
        addCategoryReset({
          categoryName: "",
          categoryDescription: "",
        });

        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const filtered = filter(allCategoriesResData, (o) => Boolean(o));
        dispatch(setManageProductCategories(filtered));
        const found = filtered.find((o) => o?.product_category === data?.name);
        setValue("productCategory", found?.product_category_id ?? ""); // add new cateogry and select it
        addToast(message, { appearance: "success", autoDismiss: true });
        dispatch(setShowAddCategoryModal());
      } else addToast(`${message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
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

  const deleteVariant = async (name, index) => {
    try {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const r = window.confirm("Are you sure you want to delete variant?");
      if (r === true) {
        addToast(`Deleting Variant...`, { appearance: "info", autoDismiss: true, id: "delete-variant" });
        const data = {
          id: productWithVariants?.id,
          option: name,
          merchant: user?.user_merchant_id,
          mod_by: user?.login,
        };

        // console.log({ data });

        const deleteVariantRes = await axios.post("/api/products/delete-product-property", { data });
        const { status, message } = await deleteVariantRes.data;

        // console.log({ status, message });

        removeToast(`delete-variant`);

        if (Number(status) === 0) {
          addToast(message, { appearance: "success", autoDismiss: true });
          remove(index);
        } else {
          addToast(message, { appearance: "error", autoDismiss: true });
          //console.log(productWithVariants?.product_properties_variants); // TODO: automatically delete all product property variants
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

  const buttonParams = React.useMemo(() => {
    return {
      buttonText: "Update Product Details",
      buttonAction: handleSubmit(updateProduct),
    };
  }, []);

  const productHasVariantsButton = () => {
    try {
      if (watchAddVariants) {
        if (allVariants.length > 0 && allVariants[0] && allVariants[0]?.name) {
          const r = window.confirm("This action will remove all variants you have setup on this product, proceed?");
          if (r === true) {
            setValue(`addVariants`, false);
            remove();
          }
        } else {
          setValue(`addVariants`, false);
        }
      } else {
        setValue(`addVariants`, true);
        if (fields.length === 0) append({});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteImage = async (name, index) => {
    try {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const r = window.confirm("Are you sure you want to delete image?");
      if (r === true) {
        const data = {
          id: productWithVariants?.id,
          image: name,
          merchant: user?.user_merchant_id,
          mod_by: user?.login,
        };

        const deleteVariantRes = await axios.post("/api/products/delete-image", data);
        const { status, message = "" } = await deleteVariantRes.data;

        if (Number(status) === 0) {
          return true;
        } else {
          addToast(message, { appearance: "error", autoDismiss: true });
          return false;
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

      return false;
    }
  };

  React.useEffect(() => {
    if (productCategory === "addNewCategory") {
      dispatch(setShowAddCategoryModal());
    }
  }, [productCategory]);

  if (fetching || isEmpty(productWithVariants)) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <div>
      <Modal open={showAddCategoryModal} onClose={() => dispatch(setShowAddCategoryModal())} maxWidth="md">
        <AddCategory
          addCategoryRegister={addCategoryRegister}
          processing={processing}
          addCategoryErrors={addCategoryErrors}
          addCategoryHandleSumbit={addCategoryHandleSumbit}
          action={sumbitNewCategoryToServer}
        />
      </Modal>
      <button
        className="focus:outline-none font-bold"
        onClick={() => {
          dispatch(setProductWithVariants({}));
          dispatch(setProductHasVariants(false));
          router.back();
        }}
      >
        Back
      </button>
      <div className="pb-6 pt-6 px-4">
        <h1 className="mb-2 font-bold text-2xl text-center">Modify Products</h1>
        <div className="flex w-full h-full">
          <div className="w-7/12 xl:w-9/12">
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
                    <option value="addNewCategory">{`Add New Category`}</option>;
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
              </div>

              <div className="w-full mr-2">
                <input {...register("applyTax")} type="checkbox" className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2" />

                <label className="text-sm leading-none  font-bold">Apply tax on this product</label>
              </div>

              {/* Variants */}
              <div className="w-full mt-6 bg-gray-200 p-6 rounded">
                <div className="flex justify-between items-center w-full">
                  <h1 className="font-bold text-blue-700">Does your product have variants?</h1>
                  <div className="flex justify-between items-center cursor-pointer" onClick={productHasVariantsButton}>
                    <div
                      className={`${
                        watchAddVariants ? "bg-green-400" : ""
                      } w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out`}
                    >
                      <div
                        className={`${
                          watchAddVariants ? "translate-x-4" : ""
                        } bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out`}
                      />
                    </div>
                  </div>
                </div>
                <h1>Multiple options of the same product which customers can choose from</h1>
                <hr className="text-blue-500 bg-blue-500" />
                {watchAddVariants && (
                  <div className="mt-2">
                    <div className="flex flex-wrap justify-center items-center w-full">
                      {fields?.map(({ id, name, values }, index) => {
                        // console.log({ name });
                        return (
                          <div key={id} className="w-full my-3">
                            <div key={id} className="flex w-full justify-between">
                              <div className="w-1/4 mr-2">
                                <label className="text-xs leading-none font-bold">Variant Name</label>
                                <input
                                  {...register(`variants[${index}].name`, {
                                    validate: {
                                      notDuplicate: (value) => {
                                        const foundItems = filter(allVariants, (o) => capitalize(o?.name?.trim()) === capitalize(value?.trim()));
                                        // console.log(value, foundItems?.length, allVariants);
                                        return foundItems?.length < 2 || `Duplicate variant entered`;
                                      },
                                      notEmpty: (value) => (watchAddVariants ? Boolean(value) : true) || "Variant name must be entered",
                                    },
                                  })}
                                  defaultValue={name}
                                  type="text"
                                  placeholder="eg. Size"
                                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none focus:ring-1 w-full mb-2"
                                />
                                {errors[`variants`] && errors[`variants`][index] && (
                                  <p className="text-xs text-red-500">{errors[`variants`][index]?.name?.message}</p>
                                )}
                              </div>

                              <div className="w-1/2">
                                <label className="text-xs leading-none font-bold">
                                  Variant Values <span className="text-xs">(Separated by comma ",")</span>
                                </label>
                                <input
                                  {...register(`variants[${index}].values`, {
                                    validate: (value) => (watchAddVariants ? Boolean(value) : true) || "Variant values must be entered",
                                  })}
                                  defaultValue={values}
                                  type="text"
                                  placeholder="eg. Small,Medium,Large"
                                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none focus:ring-1 w-full "
                                />
                                {errors[`variants`] && errors[`variants`][index] && (
                                  <p className="text-xs text-red-500">{errors[`variants`][index]?.values?.message}</p>
                                )}
                              </div>

                              <div id="add-variant-buttons" className="w-1/5 flex">
                                {fields.length > 1 && (
                                  <div
                                    className="font-bold bg-red-500 rounded w-9 h-9 ml-2 mt-5 cursor-pointer flex justify-center items-center"
                                    onClick={async () => {
                                      clearErrors(`variants[${index}]`);
                                      remove(index);

                                      return;
                                      if (name) await deleteVariant(name, index);
                                      else {
                                        clearErrors(`variants[${index}]`);
                                        remove(index);
                                      }
                                    }}
                                  >
                                    <button className="justify-self-end focus:outline-none">
                                      <i className="fas fa-trash-alt text-white"></i>
                                    </button>
                                  </div>
                                )}

                                {fields?.length < 5 && index === fields.length - 1 && (
                                  <div
                                    className="font-bold bg-green-500 rounded w-9 h-9 ml-2 mt-5 cursor-pointer flex justify-center items-center"
                                    onClick={() => {
                                      append({});
                                    }}
                                  >
                                    <i className="fas fa-plus text-white" />
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
          <div className="w-5/12 xl:w-4/12 pb-6 px-4">
            <div className="bg-gray-200 p-2 pt-0 rounded">
              <h1 className="font-bold">Product Gallery</h1>
              <hr className="border-gray-500" />
              <p className="my-2 text-sm font-bold text-gray-600">Upload product images, max of {maxNumber} images (Optional)</p>
              <p className="mt-2 text-sm font-bold text-red-500">Minimum Size: 800x800</p>

              <div className="bg-white m-2" style={{ height: 200 }}>
                <div className="flex flex-col justify-center items-center border border-gray-200 h-full w-full">
                  <UploadImage maxNumber={maxNumber} classes="" setValue={setValue} images={images} setImages={setImages} deleteImage={deleteImage} />
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
      </div>
    </div>
  );
};

export default EditProductNoVariants;

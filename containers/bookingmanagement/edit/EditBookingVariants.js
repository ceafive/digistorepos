import { current } from "@reduxjs/toolkit";
import axios from "axios";
import ButtonSpinner from "components/ButtonSpinner";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import {
  setManageProductCategories,
  setManageProductOutlets,
  setProductWithVariants,
  setShowAddCategoryModal,
} from "features/manageproducts/manageproductsSlice";
import {
  capitalize,
  filter,
  find,
  flatten,
  get,
  has,
  intersectionWith,
  isEmpty,
  isEqual,
  map,
  sortBy,
  split,
  trim,
  union,
  unionBy,
  unionWith,
  uniq,
} from "lodash";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import AddCategory from "../create/AddCategory";
import UploadImage from "../create/UploadImage";
import DayPickerComponent from "../DayPickerComponent";
import AddNewVariantName from "./AddNewVariantName";
import AddNewVariantValue from "./AddNewVariantValue";

const EditProduct = ({
  setGoToVarianceConfig,
  setRefetch,
  control,
  register,
  watch,
  setValue,
  clearErrors,
  errors,
  handleSubmit,
  originalVariantsDistribution,
}) => {
  const { addToast, removeToast, updateToast } = useToasts();
  const dispatch = useDispatch();
  const router = useRouter();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: availableDatesFields,
    append: availableDatesAppend,
    remove: availableDatesRemove,
  } = useFieldArray({
    control,
    name: "availableDates",
  });

  const { fields: availableDaysFields } = useFieldArray({
    control,
    name: "availableDays",
  });

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);
  const showAddCategoryModal = useSelector((state) => state.manageproducts.showAddCategoryModal);

  // console.log(productWithVariants);

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [showAddNewVariantName, setShowAddNewVariantName] = React.useState(false);
  const [showAddNewVariantValue, setShowAddNewVariantValue] = React.useState(false);
  const [variantClicked, setVariantClicked] = React.useState(null);
  const [images, setImages] = React.useState(productWithVariants?.productImages ?? []);
  const [availableDates, setAvailableDates] = useState(productWithVariants?.availableDates?.length ? true : false);

  const {
    register: addCategoryRegister,
    reset: addCategoryReset,
    formState: { errors: addCategoryErrors },
    handleSubmit: addCategoryHandleSumbit,
  } = useForm();

  const productCategory = watch("productCategory", false);
  const maxNumber = 1;

  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

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
        applyTax,
        variants,
        availableDates,
        availableDays,
      } = data;

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

      const variant_options = productWithVariants?.variantsDistribution?.reduce((acc, value, index) => {
        return {
          ...acc,
          [index]: value,
        };
      }, {});

      const payload = {
        id,
        name: productName,
        desc: productDescription,
        price: parseFloat(sellingPrice),
        cost: costPerItem,
        quantity: -99,
        category: productCategory,
        tag: "NORMAL",
        taxable: applyTax,
        sku,
        weight,
        barcode,
        is_price_global: "YES",
        old_outlet_list,
        outlet_list: JSON.stringify(outlets),
        property_delete_all: "NO",
        property_list: JSON.stringify(!isEmpty(property_list) ? property_list : { 0: {} }),
        variants_options: JSON.stringify(!isEmpty(variant_options) ? variant_options : { 0: {} }),
        booking_dates: JSON.stringify(availableDates),
        booking_days: JSON.stringify(availableDays),
        merchant: user["user_merchant_id"],
        mod_by: user["login"],
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

      console.log(payload);
      // return;

      const updateProductRes = await axios.post("/api/products/update-product", {
        data: payload,
      });

      const response = await updateProductRes.data;
      // console.log(response);

      if (Number(response?.status) === 0) {
        addToast(response?.message, { appearance: "success", autoDismiss: true });

        // reset({
        //   productName: "",
        //   productCategory: "",
        //   productDescription: "",
        //   sku: "",
        //   outlets: [],
        //   weight: "",
        //   barcode: "",
        //   sellingPrice: "",
        //   costPerItem: "",
        //   productImages: [],
        //   applyTax: false,
        //   inventoryQuantity: "",
        // });
        setImages([]);
        router.replace("/products/manage");
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

  const deleteProperty = async (name, index) => {
    try {
      const r = window.confirm("Are you sure you want to delete variant?");
      if (r === true) {
        addToast(`Deleting Variant...`, { appearance: "info", autoDismiss: true, id: "delete-variant" });
        const data = {
          id: productWithVariants?.id,
          option: name,
          merchant: user?.user_merchant_id,
          mod_by: user?.login,
        };

        const deletePropertyRes = await axios.post("/api/products/delete-product-property", { data });
        const { status, message } = await deletePropertyRes.data;

        removeToast(`delete-variant`);

        if (Number(status) === 0) {
          addToast(message, { appearance: "success", autoDismiss: true });
          remove(index);
          setRefetch(new Date());
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

  const deleteVariant = async (id) => {
    try {
      const data = {
        variant: id,
        product: productWithVariants?.id,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      // console.log({ data });

      const deleteVariantRes = await axios.post("/api/products/delete-product-variant", { data });
      const { status, message } = await deleteVariantRes.data;

      removeToast(`delete-variant`);

      if (Number(status) === 0) {
        return true;
      } else {
        false;
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

  const deleteImage = async (name, index) => {
    try {
      const r = window.confirm("Are you sure you want to delete image?");
      if (r === true) {
        const data = {
          id: productWithVariants?.id,
          image: name,
          merchant: user?.user_merchant_id,
          mod_by: user?.login,
        };

        const deleteImageRes = await axios.post("/api/products/delete-image", data);
        const { status, message = "" } = await deleteImageRes.data;

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

  const addProductVariantValue = async (values) => {
    try {
      setProcessing(true);
      const variantValues = values?.variantValues
        .split(",")
        .map((value) => capitalize(value.trim()))
        .filter((value) => Boolean(value));

      let findVariant = productWithVariants?.variants?.find((variant) => variant?.name === variantClicked?.name);
      let oldValues = findVariant?.values.split(",");
      const newValues = uniq(oldValues.concat(variantValues));

      const data = {
        id: productWithVariants?.id,
        property: variantClicked?.name,
        old_option_list: JSON.stringify(oldValues),
        new_option_list: JSON.stringify(newValues),
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      const addVariantValueRes = await axios.post("/api/products/update-product-variant-value", data);
      const { status, message = "" } = await addVariantValueRes.data;

      if (Number(status) === 0) {
        addToast(`Added`, { appearance: "success", autoDismiss: true });
        setRefetch(new Date());
        return true;
      } else {
        console.log(message);
        addToast(message, { appearance: "error", autoDismiss: true });
        return false;
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
    } finally {
      setProcessing(false);
      setVariantClicked(null);
      setShowAddNewVariantValue(false);
    }
  };

  const deletProductVariantValue = async (name, variantValue, variantValues) => {
    try {
      setProcessing(true);

      const oldValues = variantValues
        .split(",")
        .map((value) => capitalize(value.trim()))
        .filter((value) => Boolean(value));

      const newValues = oldValues.filter((oldValue) => oldValue !== variantValue);

      const data = {
        id: productWithVariants?.id,
        property: name,
        old_option_list: JSON.stringify(oldValues),
        new_option_list: JSON.stringify(newValues),
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      const addVariantValueRes = await axios.post("/api/products/update-product-variant-value", data);
      const { status, message = "" } = await addVariantValueRes.data;

      if (Number(status) === 0) {
        addToast(`Deleted`, { appearance: "success", autoDismiss: true });
        setRefetch(new Date());
        return true;
      } else {
        addToast(message, { appearance: "error", autoDismiss: true });
        return false;
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
    } finally {
      setProcessing(false);
    }
  };

  const addProductVariantName = async (values) => {
    try {
      setProcessing(true);
      let variants = productWithVariants?.variants;
      const variantNameExists = variants?.find((variant) => variant?.name.toLowerCase() === values?.variantName.toLowerCase());

      if (variantNameExists) {
        return addToast(`Variant already exists`, { appearance: `error`, autoDismiss: true });
      }

      const newVariants = [{ name: values?.variantName, values: values?.variantValue }];

      let propertyListIndexIncrease = -1;
      const property_list = newVariants?.reduce((acc, val) => {
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

      const addNewVariant = productWithVariants?.variantsDistribution?.map((distribution) => {
        return {
          ...distribution,
          variantOptionValue: {
            ...distribution?.variantOptionValue,
            [capitalize(values?.variantName)]: capitalize(values?.variantValue),
          },
        };
      });

      const newVarianceDistribution = addNewVariant.reduce((acc, value, index) => {
        return {
          ...acc,
          [index]: value,
        };
      }, {});

      const data = {
        id: productWithVariants?.id,
        // property_list: property_list,
        // variants_options: newVarianceDistribution,
        property_list: JSON.stringify(property_list),
        variants_options: JSON.stringify(!isEmpty(newVarianceDistribution) ? newVarianceDistribution : { 0: {} }),
        // variants_options: JSON.stringify(newVarianceDistribution),
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
        option: capitalize(values?.variantName),
      };

      console.log(data);
      // return;
      const addVariantValueRes = await axios.post("/api/products/add-product-variant", data);
      const { status, message = "" } = await addVariantValueRes.data;

      if (Number(status) === 0) {
        addToast(`Added`, { appearance: "success", autoDismiss: true });
        setShowAddNewVariantName(false);
        setRefetch(new Date());
        return true;
      } else {
        console.log(message);
        addToast(message, { appearance: "error", autoDismiss: true });
        return false;
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
    } finally {
      setProcessing(false);
    }
  };

  // console.log({ fields });

  return (
    <div>
      <Modal open={showAddCategoryModal} onClose={() => dispatch(setShowAddCategoryModal())} maxWidth="sm">
        <AddCategory
          addCategoryRegister={addCategoryRegister}
          processing={processing}
          addCategoryErrors={addCategoryErrors}
          addCategoryHandleSumbit={addCategoryHandleSumbit}
          action={sumbitNewCategoryToServer}
        />
      </Modal>
      <Modal
        open={showAddNewVariantName}
        onClose={() => {
          setShowAddNewVariantName(false);
        }}
        maxWidth="sm"
      >
        <AddNewVariantName
          processing={processing}
          action={(values) => {
            addProductVariantName(values);
          }}
        />
      </Modal>

      <Modal
        open={showAddNewVariantValue}
        onClose={() => {
          setVariantClicked(null);
          setShowAddNewVariantValue(false);
        }}
        maxWidth="sm"
      >
        <AddNewVariantValue
          processing={processing}
          action={(values) => {
            addProductVariantValue(values);
          }}
        />
      </Modal>
      <button
        className="focus:outline-none font-bold"
        onClick={() => {
          dispatch(setProductWithVariants({}));
          router.back();
        }}
      >
        Back
      </button>
      <div className="pb-6 pt-6 px-4">
        <h1 className="mb-2 font-bold text-2xl text-center">Modify Booking</h1>
        <div className="flex w-full h-full">
          <div className="w-7/12 xl:w-8/12">
            <div>
              <h1 className="font-bold text-blue-700">Booking Details</h1>
              <div className="flex w-full justify-between items-center">
                <div className="w-1/2 mr-2">
                  <label className="text-sm leading-none  font-bold">Name</label>
                  <input
                    {...register("productName", { required: "Name is required" })}
                    type="text"
                    placeholder="Malaria"
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                  />
                  <p className="text-xs text-red-500">{errors["productName"]?.message}</p>
                </div>

                <div className="w-1/2">
                  <label className="text-sm leading-none  font-bold">Category</label>
                  <select
                    {...register("productCategory", { required: "Category is required" })}
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
              <div className="flex w-full justify-between mt-4">
                <div className="w-1/2 mr-2">
                  <label className="text-sm leading-none  font-bold">Description (Optional)</label>
                  <textarea
                    {...register("productDescription", { required: false })}
                    type="text"
                    rows={4}
                    placeholder="Enter a short description"
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-sm leading-none  font-bold">Fee</label>
                  <input
                    {...register("sellingPrice", { required: "Fee is required" })}
                    type="number"
                    placeholder="12"
                    min="1"
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                  />
                  <p className="text-xs text-red-500">{errors["sellingPrice"]?.message}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between w-full my-4">
                <div className="w-1/2">
                  <h1 className="font-bold text-blue-700">Available Dates</h1>
                  <div className="flex items-center">
                    <input
                      checked={availableDates}
                      onChange={(e) => {
                        setAvailableDates(e.target.checked);
                        if (e.target.checked) {
                          availableDatesAppend({
                            from: "",
                            to: "",
                          });
                        } else availableDatesRemove();
                      }}
                      type="checkbox"
                      className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                    />
                    <label className="text-sm leading-none font-bold">Set Available Dates</label>
                  </div>

                  {availableDates && (
                    <div className="mt-2">
                      <div className="">
                        {availableDatesFields.map(({ id }, index) => {
                          return (
                            <div key={id} className=" my-1">
                              <div key={id} className="flex">
                                <div className="">
                                  <label className="text-xs leading-none font-bold">Date Range</label>
                                  <DayPickerComponent index={index} control={control} availableDates={availableDates} />
                                </div>

                                <div className="flex mt-1">
                                  {availableDatesFields.length > 1 && (
                                    <div
                                      className="flex items-center font-bold bg-red-500 rounded py-1 px-4 ml-2 mt-4 cursor-pointer"
                                      onClick={() => {
                                        availableDatesRemove(index);
                                      }}
                                    >
                                      <button className="focus:outline-none">
                                        <i className="fas fa-trash-alt text-white"></i>
                                      </button>
                                    </div>
                                  )}

                                  <div
                                    className="flex items-center font-bold bg-green-500 rounded py-1 px-4 ml-2 mt-4 cursor-pointer"
                                    onClick={() => {
                                      availableDatesAppend({
                                        from: "",
                                        to: "",
                                      });
                                    }}
                                  >
                                    <button className="focus:outline-none">
                                      <i className="fas fa-plus text-white" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <hr className="mt-3" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-1/2">
                  <h1 className="font-bold text-blue-700">Available Days</h1>
                  <div className="w-full">
                    {availableDaysFields.map((data, index) => {
                      const { id, day, duration, isClosed } = data;
                      // console.log(data);
                      // console.log(isClosed);

                      return (
                        <div key={id} className="w-full">
                          <div key={id} className="flex items-center w-full">
                            <div className=" mr-2">
                              <label className="text-xs leading-none font-bold">Day</label>
                              <input
                                {...register(`availableDays[${index}].day`, {})}
                                defaultValue={day}
                                type="text"
                                disabled={true}
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none focus:ring-1 w-full mb-2"
                              />
                            </div>
                            <div className="">
                              <label className="text-xs leading-none font-bold">Duration</label>
                              <input
                                {...register(`availableDays[${index}].duration`, {
                                  validate: (value) => (isClosed ? true : Boolean(value) || "Duration must be entered"),
                                })}
                                defaultValue={duration}
                                type="text"
                                placeholder="eg. 08:00AM - 09:00AM"
                                disabled={isClosed}
                                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                              />
                              {errors[`availableDays`] && errors[`availableDays`][index] && (
                                <p className="text-xs text-red-500 -mt-2">{errors[`availableDays`][index]?.duration?.message}</p>
                              )}
                            </div>

                            <div className="flex items-center ml-4">
                              <input
                                {...register(`availableDays[${index}].isClosed`, {
                                  deps: [`availableDays[${index}].duration`],
                                })}
                                type="checkbox"
                                className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                              />
                              <label className="text-sm leading-none font-bold">Closed?</label>
                            </div>
                          </div>
                          <hr className="my-1" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="w-full mt-6 bg-gray-200 py-2 px-6 rounded">
                <div className="flex justify-end items-center w-full">
                  <button
                    className="text-xs font-bold text-blue-700"
                    onClick={() => {
                      setGoToVarianceConfig(true);
                    }}
                  >
                    Edit Variants
                  </button>
                </div>
                <h1>Multiple options of the same product which customers can choose from</h1>
                <hr className="text-blue-500 bg-blue-500" />

                <div className="mt-2 ">
                  <div className="flex flex-wrap justify-center items-center w-full ">
                    {sortBy(fields, ["name"])?.map(({ id, name, values }, index) => {
                      // console.log(values);
                      return (
                        <div key={id} className="w-full my-1 ">
                          <div key={id} className="flex w-full justify-between items-center ">
                            <div className="">
                              <label className="text-xs leading-none font-bold">Variant Name</label>
                              <div className="flex bg-gray-300 p-1 items-center rounded">
                                <p className="mr-1">{name}</p>
                              </div>
                            </div>

                            <div className="w-1/2">
                              {/* <div className="w-1/2"> */}
                              <label className="text-xs leading-none font-bold">Variant Values</label>
                              <div className="flex flex-wrap">
                                {(values || ``)?.split(",").map((value, index) => {
                                  return (
                                    <div key={index} className="flex bg-gray-300 p-1 items-center rounded mr-1 mb-1">
                                      <p className="mr-1">{value}</p>
                                      {(values || ``)?.split(",")?.length > 1 && (
                                        <button
                                          onClick={async () => {
                                            const variantsDistribution = productWithVariants?.variantsDistribution;
                                            if (variantsDistribution?.length) {
                                              console.log(variantsDistribution);
                                              console.log(originalVariantsDistribution);

                                              if (originalVariantsDistribution?.length === 1) {
                                                addToast(
                                                  `At least one variant permutation must exist, this cannot be deleted. Add and save new permutations before deleting this`,
                                                  {
                                                    appearance: "error",
                                                    autoDismiss: true,
                                                    id: "delete-variant-name",
                                                  }
                                                );
                                              } else {
                                                const foundVariantNames = variantsDistribution.filter((variant) => {
                                                  const optionValues = Object.values(variant?.variantOptionValue);
                                                  return optionValues.includes(value);
                                                });

                                                if (foundVariantNames?.length > 0) {
                                                  const r = window.confirm(
                                                    "This action will delete all variant permutations associated with this variant, continue?"
                                                  );

                                                  if (r === true) {
                                                    addToast(`Deleting '${value}' variant permutations...`, {
                                                      appearance: "info",
                                                      autoDismiss: true,
                                                      id: "delete-variant-name",
                                                    });

                                                    for (let i = 0; i < foundVariantNames?.length; i++) {
                                                      await deleteVariant(foundVariantNames[i]?.variantOptionId);
                                                    }

                                                    updateToast(`delete-variant-name`, { content: `Deleting '${value}' variant` });
                                                    //call delete single property api
                                                    deletProductVariantValue(name, value, values);
                                                  }
                                                } else {
                                                  //call delete single property api
                                                  deletProductVariantValue(name, value, values);
                                                }
                                              }
                                            } else {
                                              //call delete single property api
                                              deletProductVariantValue(name, value, values);
                                            }
                                          }}
                                        >
                                          <i className="fas fa-window-close text-red-500"></i>
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div id="add-variant-buttons" className="flex items-center">
                              <button
                                className="text-xs font-bold text-blue-700"
                                onClick={() => {
                                  setVariantClicked({ name, values });
                                  setShowAddNewVariantValue(true);
                                }}
                              >
                                Add new variant value
                              </button>

                              <div
                                className={`font-bold ${
                                  fields?.length < 2 ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 "
                                }  rounded w-7 h-7 ml-2 cursor-pointer flex justify-center items-center`}
                                onClick={async () => {
                                  if (fields?.length < 2) return null;
                                  if (name) await deleteProperty(name, index);
                                  else {
                                    clearErrors(`variants[${index}]`);
                                    remove(index);
                                  }
                                }}
                              >
                                <i className="fas fa-trash-alt text-white text-xs"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {productWithVariants?.variants?.length < 1 && (
                  <button
                    className="text-xs font-bold text-blue-700 mr-2 mt-6"
                    onClick={() => {
                      // setVariantClicked({ name, values });
                      setShowAddNewVariantName(true);
                    }}
                  >
                    Add new variant
                  </button>
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
                onClick={handleSubmit(updateProduct)}
              >
                {isProcessing && (
                  <div className="inline-block mr-2">
                    <Spinner type={"TailSpin"} color="black" width={10} height={10} />
                  </div>
                )}
                <span>Update Product Details</span>
              </button>
            </div>
          </div>
          {/* Right Side */}
        </div>
      </div>
    </div>
  );
};

export default EditProduct;

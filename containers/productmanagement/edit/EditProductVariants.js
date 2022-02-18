import axios from "axios";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import {
  setManageProductCategories,
  setProductHasVariants,
  setProductWithVariants,
  setShowAddCategoryModal,
} from "features/manageproducts/manageproductsSlice";
import { capitalize, filter, flatten, flattenDeep, get, isEmpty, map, split, trim, uniq } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import AddCategory from "../create/AddCategory";
import UploadImage from "../create/UploadImage";
import AddNewVariantName from "./AddNewVariantName";
import AddNewVariantValue from "./AddNewVariantValue";

const EditProductVariants = ({ setGoToVarianceConfig, setRefetch, control, register, reset, watch, setValue, clearErrors, errors, handleSubmit }) => {
  const { addToast, removeToast, updateToast } = useToasts();
  const dispatch = useDispatch();
  const router = useRouter();

  const { fields, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const productHasVariants = useSelector((state) => state.manageproducts.productHasVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);
  const showAddCategoryModal = useSelector((state) => state.manageproducts.showAddCategoryModal);

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

  // React.useEffect(() => {
  //   console.log(getValues());
  // }, [getValues()]);

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

      const imagesToUpload = productImages?.map((productImage) => productImage) ?? [];
      let propertyListIndexIncrease = -1;

      const property_list = variants?.reduce((acc, val) => {
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

      const variant_options = productWithVariants?.variantsDistribution?.reduce((acc, value, index) => {
        // console.log(value);
        return {
          ...acc,
          [index]: { ...value, variantOptionBookingSlot: "-99" },
        };
      }, {});

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
        property_list: addVariants ? JSON.stringify(!isEmpty(property_list) ? property_list : { 0: {} }) : JSON.stringify({ 0: {} }),
        variants_options: addVariants ? JSON.stringify(!isEmpty(variant_options) ? variant_options : { 0: {} }) : JSON.stringify({ 0: {} }),
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

      // console.log(payload);
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
      const { status } = await deleteVariantRes.data;

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

  // const productHasVariantsButton = () => {
  //   try {
  //     if (productHasVariants) {
  //       if (allVariants.length > 0 && allVariants[0] && allVariants[0]?.name) {
  //         const r = window.confirm("This action will remove all variants you have setup on this product, proceed?");
  //         if (r === true) {
  //           dispatch(setProductHasVariants(false));
  //           remove();
  //         }
  //       } else {
  //         dispatch(setProductHasVariants(false));
  //       }
  //     } else {
  //       dispatch(setProductHasVariants(true));
  //       // if (fields.length === 0) append({});
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
        // if (fields.length === 0) append({});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteImage = async (name) => {
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

  const addProductProperty = async (values) => {
    try {
      setProcessing(true);
      let variants = productWithVariants?.variants;
      const propertyNameExists = variants?.find((variant) => variant?.name.toLowerCase() === values?.propertyName.toLowerCase());

      if (propertyNameExists) {
        return addToast(`Variant already exists`, { appearance: `error`, autoDismiss: true });
      }

      const newVariants = [{ name: values?.propertyName, values: values?.propertyValue }];

      let propertyListIndexIncrease = -1;
      const property_list = newVariants?.reduce((acc, val) => {
        const values = Object.values(val);
        const propertyName = capitalize(values[0]);
        const variantsStringArray = map(
          filter(map(split(values[1], ","), trim), (o) => Boolean(o)),
          capitalize
        );

        const entries = variantsStringArray.reduce((acc, value) => {
          propertyListIndexIncrease += 1;
          return {
            ...acc,
            [propertyListIndexIncrease]: {
              propertyId: propertyName,
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

      // console.log(property_list);

      const property_list_values = Object.values(property_list);
      // console.log(property_list_values);

      const addNewVariant = [];
      property_list_values.forEach((property) => {
        return productWithVariants?.variantsDistribution?.map((distribution) => {
          const newDistribution = { ...distribution };
          // delete newDistribution?.variantOptionId;
          // console.log(newDistribution);
          addNewVariant.push({
            ...newDistribution,
            // variantOptionId: newDistribution?.variantOptionId || "",
            variantOptionValue: {
              ...newDistribution?.variantOptionValue,
              [capitalize(property?.propertyId)]: capitalize(property?.propertyValue),
            },
          });
        });
      });

      // const addNewVariant = productWithVariants?.variantsDistribution?.map((distribution) => {
      //   return {
      //     ...distribution,
      //     variantOptionValue: {
      //       ...distribution?.variantOptionValue,
      //       [capitalize(values?.propertyName)]: capitalize(values?.propertyValue),
      //     },
      //   };
      // });

      // console.log(addNewVariant);
      // return;

      const newVarianceDistribution = addNewVariant.reduce((acc, value, index) => {
        return {
          ...acc,
          [index]: value,
        };
      }, {});

      // console.log(newVarianceDistribution);

      const data = {
        id: productWithVariants?.id,
        option: capitalize(values?.propertyName),
        // property_list: property_list,
        // variants_options: newVarianceDistribution,
        property_list: JSON.stringify(property_list),
        variants_options: JSON.stringify(!isEmpty(newVarianceDistribution) ? newVarianceDistribution : { 0: {} }),
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      // console.log(data);
      // return;
      const addPropertyValueRes = await axios.post("/api/products/add-product-variant", data);
      const resData = await addPropertyValueRes.data;
      // console.log(resData);

      const { status, message = "" } = resData;

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
        <AddCategory processing={processing} setValue={setValue} setProcessing={setProcessing} />
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
            addProductProperty(values);
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
          dispatch(setProductHasVariants(false));
          router.back();
        }}
      >
        Back
      </button>
      <div className="pb-6 pt-6 px-4">
        <h1 className="mb-2 font-bold text-2xl text-center">Modify Products</h1>
        <div className="flex w-full h-full">
          <div className="w-7/12 xl:w-8/12">
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
                    {manageProductCategories?.map((category, index) => {
                      return (
                        <option key={category?.product_category_id + index} value={category?.product_category_id}>
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
              {!watchAddVariants && (
                <div>
                  <h1 className="font-bold text-blue-700">Pricing</h1>
                  <div className="flex w-full justify-between items-center">
                    <div className="w-1/2 mr-2">
                      <label className="text-sm leading-none  font-bold">Selling Price</label>
                      <input
                        {...register("sellingPrice", { required: "Selling price is required" })}
                        type="number"
                        min="1"
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
                        min="1"
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
                            min="1"
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
                        min="1"
                        placeholder=""
                        className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                      />
                      <p className="text-xs text-red-500">{errors["weight"]?.message}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-full mr-2">
                <input {...register("applyTax")} type="checkbox" className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2" />
                <label className="text-sm leading-none  font-bold">Apply tax on this product</label>
              </div>

              {/* Variants */}
              <div className="w-full mt-6 bg-gray-200 py-2 px-6 rounded">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <div className="mr-10">
                      <h1 className="font-bold text-blue-700">Does your product have properties?</h1>
                    </div>
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
                  {watchAddVariants && (
                    <button
                      className="text-xs font-bold text-blue-700"
                      onClick={() => {
                        setGoToVarianceConfig(true);
                      }}
                    >
                      Edit Variants
                    </button>
                  )}
                </div>
                <h1>Multiple options of the same product which customers can choose from</h1>
                <hr className="text-blue-500 bg-blue-500" />
                {watchAddVariants && (
                  <div className="mt-2 ">
                    <div className="flex flex-wrap justify-center items-center w-full ">
                      {fields?.map(({ id, name, values }, index) => {
                        // console.log(values);
                        // {sortBy(fields, ["name"])?.map(({ id, name, values }, index) => {
                        // console.log(values);
                        return (
                          <div key={id + index} className="w-full my-1 ">
                            <div key={id} className="flex w-full justify-between ">
                              <div className="">
                                <label className="text-xs leading-none font-bold">Property Name</label>
                                <div className="flex bg-gray-300 p-1 items-center rounded">
                                  <p className="mr-1">{name}</p>
                                </div>
                              </div>

                              <div className="w-1/2">
                                {/* <div className="w-1/2"> */}
                                <label className="text-xs leading-none font-bold">Property Values</label>
                                <div className="flex flex-wrap">
                                  {(values || ``)?.split(",").map((value, index) => {
                                    return (
                                      <div key={value + index} className="flex bg-gray-300 p-1 items-center rounded mr-1 mb-1">
                                        <p className="mr-1">{value}</p>
                                        <button
                                          onClick={async () => {
                                            if (productWithVariants?.variantsDistribution?.length > 0) {
                                              const variantsDistribution = productWithVariants?.variantsDistribution;

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
                                            } else {
                                              //call delete single property api
                                              deletProductVariantValue(name, value, values);
                                            }
                                          }}
                                        >
                                          <i className="fas fa-window-close text-red-500"></i>
                                        </button>
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
                                  Add new property value
                                </button>

                                <div
                                  className="font-bold bg-red-500 rounded w-7 h-7 ml-2 cursor-pointer flex justify-center items-center"
                                  onClick={async () => {
                                    if (name) await deleteProperty(name, index);
                                    else {
                                      clearErrors(`variants[${index}]`);
                                      remove(index);
                                    }
                                  }}
                                >
                                  <i className="fas fa-trash-alt text-white text-xs"></i>
                                </div>

                                {/* {fields?.length < 5 && index === fields.length - 1 && (
                                  <div
                                    className="font-bold bg-green-500 rounded w-7 h-7 ml-2 mt-5 cursor-pointer flex justify-center items-center"
                                    onClick={() => {
                                      append({});
                                    }}
                                  >
                                    <i className="fas fa-plus text-white" />
                                  </div>
                                )} */}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {productWithVariants?.variants?.length < 5 && (
                  <button
                    className="text-xs font-bold text-blue-700 mr-2 mt-6"
                    onClick={() => {
                      // setVariantClicked({ name, values });
                      setShowAddNewVariantName(true);
                    }}
                  >
                    Add new property
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
              <p className="mt-2 text-sm font-bold text-red-500">Minimum Dimensions: 800x800</p>
              <p className="mt-2 text-sm font-bold text-red-500">Maximum Size: 2MB</p>

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

export default EditProductVariants;

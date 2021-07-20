import axios from "axios";
import AddBasicProductDetails from "components/ProductsManagement/create/AddBasicProductDetails";
import Spinner from "components/Spinner";
import {
  setManageProductCategories,
  setManageProductOutlets,
  setProductHasVariants,
  setProductWithVariants,
} from "features/manageproducts/manageprodcutsSlice";
import { capitalize, filter, intersectionWith, isEmpty, map } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import EditProduct from "./EditProduct";
import EditProductAndVariants from "./EditProductAndVariants";
import ViewProduct from "./ViewProduct";

const ViewEditAProduct = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const manageProductProducts = useSelector((state) => state.manageproducts.manageProductProducts);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
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
    defaultValues: productWithVariants,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Compnent State
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    const product = manageProductProducts.find((product) => product?.product_id === router?.query?.product_id);
    console.log(product);

    const fetchItems = async () => {
      try {
        setFetching(true);
        const filteredOutlets = filter(product?.product_outlets ?? [], (o) => Boolean(o));
        const intersectedOutlets = intersectionWith(
          manageProductOutlets,
          filteredOutlets,
          (arrVal, othVal) => arrVal?.outlet_id === othVal?.outlet_id
        );

        // merge props
        const initial = {
          id: product?.product_id,
          productName: product?.product_name,
          productDescription: product?.product_description,
          sellingPrice: product?.product_price,
          costPerItem: product?.product_unit_cost,
          inventoryQuantity: product?.product_quantity === "-99" ? "" : product?.product_quantity,
          productCategory: manageProductCategories.find((category) => category?.product_category === product?.product_category)
            ?.product_category_id,
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
          variants: initial?.product_properties,
          variantsDistribution: initial?.product_properties_variants,
          weight: initial?.weight,
        };

        // console.log({ initial });
        // console.log(Object.entries(valuesToDispatch));

        Object.entries(valuesToDispatch).forEach(([key, value]) => setValue(key, value));
        const hasVariants = valuesToDispatch?.variants && !isEmpty(valuesToDispatch?.variants);

        dispatch(setProductWithVariants(valuesToDispatch));
        dispatch(setProductHasVariants(!!hasVariants));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();

    return () => {
      dispatch(setProductHasVariants(false));
      dispatch(setProductWithVariants({}));
    };
  }, [router]);

  if (fetching || isEmpty(productWithVariants)) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      {router?.query?.action === "view" && <ViewProduct />}
      {router?.query?.action === "edit" && (
        <EditProductAndVariants
          register={register}
          reset={reset}
          watch={watch}
          setValue={setValue}
          errors={errors}
          handleSubmit={handleSubmit}
          fields={fields}
          append={append}
          remove={remove}
        />
      )}
    </>
  );
};

export default ViewEditAProduct;

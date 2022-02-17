import axios from "axios";
import Spinner from "components/Spinner";
import { setManageProductCategories, setManageProductOutlets, setProductWithVariants } from "features/manageproducts/manageproductsSlice";
import { capitalize, filter, intersectionWith, isEmpty, map } from "lodash";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import EditBookingVariants from "./EditBookingVariants";
import EditVariance from "./EditVariance";

const EditBookingHasVariants = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    control,
    register,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "all",
  });

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);

  const [goToVarianceConfig, setGoToVarianceConfig] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [refetch, setRefetch] = React.useState(new Date());

  // this is a hack do not delete
  const [originalVariantsDistribution, setOriginalVariantsDistribution] = React.useState([]);

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

        // console.log({ product });

        const filteredOutlets = filter(product?.product_outlets ?? [], Boolean);
        const intersectedOutlets = intersectionWith(allOutlets, filteredOutlets, (arrVal, othVal) => arrVal?.outlet_id === othVal?.outlet_id);

        // merge props
        const initial = {
          id: product?.product_id,
          productName: product?.product_name,
          productDescription: product?.product_description,
          sellingPrice: product?.product_price,
          costPerItem: product?.product_unit_cost,
          inventoryQuantity: product?.product_quantity === "-99" || product?.product_quantity === "Unlimited" ? "" : product?.product_quantity,
          productCategory: allCategories.find((category) => category?.product_category === product?.product_category)?.product_category_id,
          tag: "NORMAL",
          sku: product?.product_sku,
          weight: product?.product_weight,
          barcode: product?.product_barcode,
          is_price_global: "YES",
          applyTax: product?.product_taxed === "YES" ? true : false,
          old_outlet_list: JSON.stringify(map(product?.product_outlets ?? [], (o) => o?.outlet_id)),
          outlets: map(intersectedOutlets ?? [], (o) => o?.outlet_id),
          productImages: product?.product_images?.map((image) => `https://payments.ipaygh.com/app/webroot/img/products/${image}`) ?? [],
          productImage: `https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}` ?? "",
          product_properties_variants: product?.product_properties_variants ?? [],
          // product_properties_variants: product?.product_properties_variants ?? [],
          product_properties: product?.product_properties
            ? Object.entries(product?.product_properties ?? {})?.map(([key, value]) => {
                return {
                  name: capitalize(key),
                  values: value.map((value) => value?.property_value).join(","),
                };
              })
            : [],
          availableDates: JSON.parse(product?.product_booking_dates || "[]")?.map((v, i) => {
            return {
              from: new Date(v?.from),
              to: new Date(v?.to),
            };
          }),
          availableDays: JSON.parse(product?.product_booking_days || "[]"),
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
          sku: initial?.sku,
          tag: initial?.tag,
          variants: initial?.product_properties || [],
          variantsDistribution: initial?.product_properties_variants?.map((v) => {
            return {
              variantOptionBookingSlot: 1,
              ...v,
            };
          }),
          weight: initial?.weight,
          availableDates: initial?.availableDates || [],
          availableDays: initial?.availableDays || [],
        };

        // console.log({ valuesToDispatch });
        // console.log(Object.entries(valuesToDispatch));

        reset(valuesToDispatch);
        dispatch(setProductWithVariants(valuesToDispatch));

        // hack
        setOriginalVariantsDistribution(valuesToDispatch?.variantsDistribution);
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [refetch]);

  if (fetching || isEmpty(productWithVariants)) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <div>
      {!goToVarianceConfig && (
        <EditBookingVariants
          setGoToVarianceConfig={setGoToVarianceConfig}
          setRefetch={setRefetch}
          control={control}
          register={register}
          reset={reset}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
          clearErrors={clearErrors}
          errors={errors}
          handleSubmit={handleSubmit}
          originalVariantsDistribution={originalVariantsDistribution}
        />
      )}

      {goToVarianceConfig && <EditVariance setGoToVarianceConfig={setGoToVarianceConfig} />}
    </div>
  );
};

export default EditBookingHasVariants;

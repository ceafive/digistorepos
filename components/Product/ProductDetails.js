import { openProductModal } from "features/products/productsSlice";
import { camelCase, get, lowerCase, map, reduce, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "components/Carousel";
import { useForm } from "react-hook-form";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";

const initialFormData = {};

const ProductDetails = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      quantity: 0,
    },
  });
  const product = useSelector((state) => state.products.productToView);
  // console.log(product);
  // const watchSetVariants = watch("setVariants");

  const [productPrice, setProductPrice] = React.useState(0);
  const [formData, setFormData] = React.useState({});

  // console.log({ productPrice });

  // console.log(errors);

  const variants = Object.values(product.product_properties);
  const groupVariants = variants.reduce((acc, variant) => {
    const found = acc[variant.property_id] || [];
    return { ...acc, [variant.property_id]: [...found, variant] };
  }, {});

  // const allVariants = [...Object.entries(groupVariants), ...Object.entries(groupVariants)];
  const allVariants = Object.entries(groupVariants);

  // console.log({ allVariants });

  const submitFormData = (values) => {
    function IsJsonString(str) {
      try {
        var json = JSON.parse(str);
        return typeof json === "object";
      } catch (e) {
        return false;
      }
    }

    const res = reduce(
      values,
      function (result, value, key) {
        return { ...result, [key]: IsJsonString(value) ? get(JSON.parse(value), "value") : value };
      },
      {}
    );

    // console.log(res);
    const { quantity, ...rest } = res;
    console.log({ values });

    dispatch(increaseTotalItemsInCart(Math.round(Number(res?.quantity))));
    dispatch(
      addItemToCart({
        id: product.product_id,
        title: product.product_name,
        price: Number(parseFloat(productPrice).toFixed(2)),
        imgURL: product.product_image,
        quantity,
        variants: rest,
      })
    );
    onClose();
  };

  return (
    <div className="relative flex w-full max-w-6xl rounded-lg  bg-white border border-gray-200" style={{ height: 600 }}>
      <button className="absolute right-0 top-0 p-2 text-2xl focus:outline-none text-red-500" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      <div className="flex w-full">
        <div className="w-4/12 flex items-center overflow-hidden m-2">
          <div className="w-full items-center overflow-hidden">
            <Carousel showArrows={false}>
              {product?.product_images?.map((product_image) => {
                return (
                  <div key={product_image} className="overflow-hidden">
                    <img className="" key={product_image} src={product_image} alt={product_image} style={{ maxHeight: 400 }} />
                  </div>
                );
              })}
            </Carousel>
          </div>
        </div>

        <div className="w-8/12">
          <div className="p-4 pb-0 w-full">
            <div className="text-center">
              <p className="font-bold ">
                <span className="text-xl mr-4">{upperCase(product.product_name)}</span>
                <span>GHS{product.product_price}</span>
              </p>
              <p className="text-sm">Product ID: {product.product_id}</p>
            </div>

            <hr className="my-2" />
            <div className="font-semibold text-center mb-2">
              <p>Variants</p>
            </div>
            <div className="w-full px-10">
              <div className="flex flex-wrap justify-between">
                {allVariants?.map((groupVariant) => {
                  const setVariant = {
                    ...register(
                      camelCase(groupVariant[0])
                      // { required: `Please select a ${lowerCase(groupVariant[0])}` }
                    ),
                  };
                  return (
                    <div key={groupVariant[0]} className="px-3 mb-6">
                      <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">{groupVariant[0]}</label>
                      <select
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        {...setVariant}
                        onChange={(e) => {
                          const value = JSON.parse(e.target.value);

                          const target = {
                            ...e.target,
                            value: value?.value,
                          };

                          // setValue(camelCase(groupVariant[0]), value?.value);

                          e = { ...e, target };
                          // console.log(e.target.value);
                          // setVariant.onChange(e);

                          if (value?.price) {
                            setProductPrice(Number(parseFloat(value?.price).toFixed(2)));
                          }
                        }}
                      >
                        <option value={""}></option>
                        {groupVariant[1].map((variant) => {
                          return (
                            <option
                              key={variant?.property_value}
                              value={
                                variant?.property_price_set === "YES"
                                  ? JSON.stringify({ value: variant?.property_value, price: variant?.property_price })
                                  : JSON.stringify({ value: variant?.property_value, price: null })
                              }
                            >
                              {variant?.property_value}{" "}
                              {`${
                                variant?.property_price_set === "YES"
                                  ? `- GHS${Number(parseFloat(variant?.property_price).toFixed(2))}`
                                  : ""
                              }`}
                            </option>
                          );
                        })}
                      </select>
                      <p className="text-xs text-red-500">{errors[camelCase(groupVariant[0])]?.message}</p>
                    </div>
                  );
                })}
                <div className="px-3 mb-6">
                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Quantity</label>
                  <input
                    id="quantity"
                    {...register("quantity", {
                      required: true,
                      min: {
                        value: 1,
                        message: "Quantity must be more than 0",
                      },
                    })}
                    type="number"
                    className="appearance-none bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  />
                  <p className="text-xs text-red-500">{errors?.quantity?.message}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                className={`${true ? "bg-green-600 text-white" : "bg-gray-400 text-gray-300"} py-2 px-6 font-semibold text-lg rounded`}
                onClick={() => {
                  handleSubmit(submitFormData)();
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

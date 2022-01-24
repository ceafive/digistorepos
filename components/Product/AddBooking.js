import axios from "axios";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";
import { capitalize, find, findIndex, isEqual, reduce, upperCase } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const RenderTap = ({ product, item, step, setStep, setFormData, variantName, setStepsClicked, pastOrders }) => {
  // console.log(pastOrders);

  const key = [capitalize(variantName)];
  // console.log(key);
  // console.log(product?.product_properties_variants?.[1]?.variantOptionValue[key]);
  const foundVariant = product?.product_properties_variants?.find((v) => v?.variantOptionValue[key] === item?.property_value);
  const quantity = Number(foundVariant?.variantOptionBookingSlot) === -99 ? 10000000000000 : Number(foundVariant?.variantOptionBookingSlot);
  // console.log(quantity);

  const sizeOfPastOrders = pastOrders.filter((order) => order?.order_slot === foundVariant?.variantOptionValue[capitalize(variantName)])?.length;

  const isFull = sizeOfPastOrders >= quantity;
  // console.log(isFull);

  return (
    <button
      disabled={isFull}
      className={`${isFull ? "bg-gray-50 text-gray-200" : ""} w-32 h-32 font-bold  border border-gray-200 focus:outline-none`}
      onClick={() => {
        setStepsClicked((data) => [...data, { step, variantName }]);
        setFormData((data) => ({ ...data, [variantName]: item.property_value }));
        setStep(step + 1);
      }}
    >
      {item.property_value}
    </button>
  );
};

const RenderQuantityTap = ({ product, productPrice, variantID, formData, reset, variantQuantity }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const productsInCart = useSelector((state) => state.cart.productsInCart);

  const quantities = [1, 2, 3, 4, 5];

  const submitFormData = (values) => {
    const res = reduce(values, (result, value, key) => ({ ...result, [capitalize(key)]: value }), {});
    // const res = reduce(values, (result, value, key) => ({ ...result, [capitalize(key)]: key === "date" ? new Date(value) : value }), {});

    const { Quantity, ...rest } = res;
    const data = {
      ...product,
      id: product.product_id,
      title: product.product_name,
      price: Number(parseFloat(productPrice).toFixed(2)),
      imgURL: product.product_image,
      quantity: Number(Quantity),
      variants: rest,
      variantID,
    };

    console.log({ data });
    // return;

    dispatch(increaseTotalItemsInCart(Math.round(Number(res?.Quantity))));
    dispatch(addItemToCart(data));
    reset();
  };

  const checkProductQuantity = (product, quantity) => {
    try {
      let stock_level;
      if (variantQuantity) {
        stock_level = variantQuantity === "-99" ? 10000000000000 : parseInt(variantQuantity);
      } else {
        stock_level = product?.product_quantity === "-99" ? 10000000000000 : parseInt(product?.product_quantity);
      }
      const productSoldOut = stock_level <= 0;

      if (productSoldOut) {
        return addToast(`Product sold out`, { appearance: "warning", autoDismiss: true });
      }

      const productWithVariants = { ...product, variants: formData };
      const foundProduct = productsInCart?.find((productInCart) => isEqual(productInCart?.variants, productWithVariants?.variants));

      //if not found continue
      if (foundProduct) {
        const isQuantitySelectedUnAvailable = quantity > stock_level;
        // const isQuantitySelectedUnAvailable = foundProduct?.quantity + quantity > stock_level;
        // console.log(isQuantitySelectedUnAvailable);

        if (isQuantitySelectedUnAvailable) {
          return addToast(
            `Quantity is not available, ${foundProduct?.quantity} item(s) already added to cart. Total available quantity is ${stock_level}`,
            {
              appearance: "warning",
              autoDismiss: true,
            }
          );
        }
        submitFormData({ ...formData, QUANTITY: quantity });
      } else {
        const isQuantitySelectedUnAvailable = quantity > stock_level;
        if (isQuantitySelectedUnAvailable) {
          return addToast(`Quantity is not available, available quantity is ${stock_level}`, { appearance: "warning", autoDismiss: true });
        }
        submitFormData({ ...formData, QUANTITY: quantity });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {quantities.map((quantity) => {
        return (
          <button
            key={quantity}
            className="w-32 h-32 font-bold border border-gray-200 focus:outline-none"
            onClick={() => {
              checkProductQuantity(product, quantity); //check stock quantity before add to cart
            }}
          >
            {quantity}
          </button>
        );
      })}
    </>
  );
};

function addMonths(date, months) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}

const getDaysArray = function (start, end) {
  for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt).toDateString());
    // arr.push(new Date(dt));
  }
  return arr;
};

const AddBooking = ({ onClose }) => {
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

  const { removeAllToasts } = useToasts();
  const oldProduct = useSelector((state) => state.products.productToView);

  const product = {
    ...oldProduct,
    product_properties: {
      ...oldProduct?.product_properties,
      DATE: getDaysArray(new Date(), addMonths(new Date(), 5))?.map((d) => {
        return {
          property_price: "0.00",
          property_price_set: "NO",
          property_value: d,
        };
      }),
    },
  };

  // console.log(product);

  const transformedVariants = product?.product_properties_variants.map((p) => {
    const sortedVariantProperties = {};
    Object.keys({ ...p?.variantOptionValue })
      .sort((a, b) => {
        const fa = a.toLowerCase();
        const fb = b.toLowerCase();

        if (fa < fb) {
          return -1;
        }

        if (fa > fb) {
          return 1;
        }

        return 0;
      })
      .forEach(function (v) {
        let key = v.toLowerCase();
        sortedVariantProperties[key] = p?.variantOptionValue[v];
      });
    return {
      ...p,
      variantOptionValue: sortedVariantProperties,
    };
  });

  // var arrKeys = uniq(flatten(map(transformedVariantOptionValue, keys)));
  // var arrValues = map(arrKeys, (key) => compact(map(transformedVariantOptionValue, key)));
  // var result = zipObject(arrKeys, arrValues);

  const sortedNewProductProperties = {};
  const variantProperties = product?.product_properties || {};
  Object.keys({ ...variantProperties })
    .sort((a, b) => {
      const fa = a.toLowerCase();
      const fb = b.toLowerCase();

      if (fa < fb) {
        return -1;
      }

      if (fa > fb) {
        return 1;
      }

      return 0;
    })
    .forEach(function (v) {
      let key = v.toLowerCase();
      sortedNewProductProperties[key] = product.product_properties[v];
    });

  const allVariants = Object.entries(sortedNewProductProperties);
  const noOfSteps = allVariants.length;

  // Component State
  const [productPrice, setProductPrice] = React.useState(0);
  const [formData, setFormData] = React.useState({});
  const [step, setStep] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState([allVariants[step]]);
  const [variantQuantity, setVariantQuantity] = React.useState(0);
  const [variantID, setVariantID] = React.useState("");
  const [stepsClicked, setStepsClicked] = React.useState([]);
  const [pastOrders, setPastOrders] = React.useState([]);

  // console.log(currentStep);

  const reset = () => {
    onClose();
    setProductPrice(0);
    setFormData({});
    setStepsClicked([]);
    setStep(0);
    setCurrentStep([allVariants[0]]);
  };

  React.useEffect(() => {
    if (step <= noOfSteps - 1) {
      setCurrentStep([allVariants[step]]);
    } else {
      setCurrentStep(null);
    }

    if (step === noOfSteps) {
      const newFormData = { ...formData };
      delete newFormData?.date;
      const found = find(transformedVariants, (o) => {
        return isEqual(newFormData, o?.variantOptionValue);
      });

      // console.log(newFormData);
      // console.log(found);
      // console.log(transformedVariants);

      removeAllToasts();
      setProductPrice(Number(parseFloat(found?.variantOptionPrice).toFixed(2)));
      setVariantQuantity(found?.variantOptionBookingSlot);
      setVariantID(found?.variantOptionId);
    }
  }, [noOfSteps, step]);

  // return null;

  useEffect(() => {
    if (currentStep?.[0]?.[0] === "time") {
      // console.log(formData);

      const getdata = {
        merchant: user?.user_merchant_id,
        date: new Date(formData?.date),
      };

      // console.log(getdata);
      (async () => {
        const response = await axios.post("/api/sell/sell/get-past-orders", getdata);
        const resData = await response.data;
        console.log(resData);

        const { status, data: pastOrdersResData } = resData;

        if (Number(status) === 0) {
          setPastOrders(pastOrdersResData);
        }
      })();
    }
  }, [currentStep]);

  return (
    <div className="flex w-full rounded-lg overflow-auto" style={{ minHeight: 500, maxHeight: 500 }}>
      <div className="w-full p-4">
        <div className="text-center">
          <p className="font-bold ">
            <span className="mr-4 text-xl">{upperCase(product.product_name)}</span>
          </p>
          <p className="text-sm">Product ID: {product.product_id}</p>
          <div className="mt-4">
            {step === noOfSteps && (
              <span className="mr-2 text-sm font-bold">Variant Quantity: {variantQuantity === "-99" ? "Unlimited" : variantQuantity}</span>
            )}
            {step === noOfSteps && <span className="text-sm font-bold">Variant Price: GHS{productPrice}</span>}
          </div>
        </div>

        <hr className="my-2" />
        <div className="w-full  pb-4">
          {currentStep ? (
            currentStep?.map(([key, value], index) => {
              return (
                <div key={key + index} className="w-full h-full">
                  <div className="flex items-center justify-center w-full">
                    {stepsClicked?.map((stepClicked, index) => {
                      return (
                        <button
                          key={stepClicked?.variantName}
                          className="block mb-2 mr-2 text-sm font-bold tracking-wide text-center text-gray-700 uppercase focus:outline-none"
                          onClick={() => {
                            setStep(stepClicked?.step);
                            const sliced = stepsClicked.slice(0, index);
                            // const filtered = stepsClicked.filter((clicked) => clicked?.variantName !== stepClicked?.variantName);
                            setStepsClicked(sliced);
                          }}
                        >
                          <span className="border-b-2 border-blue-500">{stepClicked?.variantName}</span>
                          <span> {">"}</span>
                        </button>
                      );
                    })}
                    <p className="block mb-2 text-sm font-bold tracking-wide text-center text-gray-700 uppercase">{key}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 xl:gap-3">
                    {value.map((item) => {
                      return (
                        <RenderTap
                          key={item?.property_value}
                          item={item}
                          setProductPrice={setProductPrice}
                          setStep={setStep}
                          step={step}
                          setFormData={setFormData}
                          setStepsClicked={setStepsClicked}
                          variantName={key}
                          formData={formData}
                          product={product}
                          pastOrders={pastOrders}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full h-full">
              <div className="flex items-center justify-center w-full">
                {stepsClicked?.map((stepClicked, index) => {
                  return (
                    <button
                      onClick={() => {
                        setStep(stepClicked?.step);
                        const sliced = stepsClicked.slice(0, index);
                        // const filtered = stepsClicked.filter((clicked) => clicked?.variantName !== stepClicked?.variantName);
                        setStepsClicked(sliced);
                      }}
                      key={stepClicked?.variantName}
                      className="block mb-2 mr-2 text-sm font-bold tracking-wide text-center text-gray-700 uppercase focus:outline-none "
                    >
                      <span className="border-b-2 border-blue-500">{stepClicked?.variantName}</span>
                      <span> {">"}</span>
                    </button>
                  );
                })}

                <p className="block mb-2 text-sm font-bold tracking-wide text-center text-gray-700 uppercase">Quantity</p>
              </div>

              <div className="flex flex-wrap gap-4 xl:gap-3">
                <RenderQuantityTap
                  product={product}
                  productPrice={productPrice}
                  formData={formData}
                  reset={reset}
                  variantQuantity={variantQuantity}
                  variantID={variantID}
                  setStep={setStep}
                  setStepsClicked={setStepsClicked}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBooking;

import Carousel from "components/Carousel";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";
import {
  capitalize,
  compact,
  find,
  findIndex,
  flatten,
  flattenDeep,
  isEqual,
  keys,
  lowerCase,
  map,
  reduce,
  snakeCase,
  uniq,
  upperCase,
  zipObject,
} from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const RenderTap = ({ item, step, setStep, setFormData, variantName, setStepsClicked, disabled }) => {
  return (
    <button
      disabled={disabled}
      className={`${disabled ? "bg-gray-50 text-gray-200" : ""} w-32 h-32 font-bold  border border-gray-200 focus:outline-none`}
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

  const quantities = [1, 2, 3, 4, 5, 6];

  const submitFormData = (values) => {
    const res = reduce(values, (result, value, key) => ({ ...result, [capitalize(key)]: value }), {});

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

    // console.log({ data });
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
      {/* <div className="flex flex-col items-center justify-center w-32 h-32 border border-gray-200">
          <input
            // type="number"
            placeholder="Enter Quantity"
            className="w-full h-full font-bold text-center appearance-none focus:appearance-none focus:text-4xl "
          ></input>
        </div> */}
    </>
  );
};

const AddProductWithVariants = ({ onClose }) => {
  const { addToast, removeAllToasts } = useToasts();
  const product = useSelector((state) => state.products.productToView);

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
      .forEach(function (v, i) {
        let key = v.toLowerCase();
        sortedVariantProperties[key] = p?.variantOptionValue[v];
      });
    return {
      ...p,
      variantOptionValue: sortedVariantProperties,
    };
  });

  const transformedVariantOptionValue = Object.values(transformedVariants?.map((p) => p?.variantOptionValue)).reduce((acc, val) => {
    const newArr = [];
    const keys = Object.keys(val);

    keys.forEach((key, i) => {
      const newObj = {
        [key]: val[key],
      };

      newArr.push(newObj);
    });

    const newestArray = [];
    let i = 0;
    let length = newArr?.length;

    do {
      i = i + 1;

      const newResult = [...newArr].slice(0, i);
      const reduced = newResult.reduce((acc, val) => {
        return {
          ...acc,
          ...val,
        };
      }, {});

      newestArray.push(reduced);
    } while (i < length);

    return [...acc, ...newestArray];
  }, []);

  const uniqTransformedVariantOptionValue = Array.from(new Set(transformedVariantOptionValue.map((item) => JSON.stringify(item)))).map((item) =>
    JSON.parse(item)
  );

  // var arrKeys = uniq(flatten(map(transformedVariantOptionValue, keys)));
  // var arrValues = map(arrKeys, (key) => compact(map(transformedVariantOptionValue, key)));
  // var result = zipObject(arrKeys, arrValues);

  const sortedNewProductProperties = {};
  Object.keys({ ...product?.product_properties })
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
    .forEach(function (v, i) {
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
      const found = find(transformedVariants, (o) => {
        return isEqual(formData, o?.variantOptionValue);
      });

      removeAllToasts();
      setProductPrice(Number(parseFloat(found?.variantOptionPrice).toFixed(2)));
      setVariantQuantity(found?.variantOptionQuantity);
      setVariantID(found?.variantOptionId);
    }
  }, [noOfSteps, step]);

  // return null;

  return (
    <div className="flex w-full rounded-lg" style={{ maxHeight: 700 }}>
      <div className="w-5/12">
        <Carousel showArrows={false} showIndicators={false} showThumbs={false} className="flex flex-col items-center justify-center w-full h-full">
          {product?.product_images && product?.product_images?.length > 0 ? (
            product?.product_images?.map((product_image) => {
              return (
                <div key={product_image} className="">
                  <img
                    className="object-cover w-full h-full"
                    key={product_image}
                    src={`https://payments.ipaygh.com/app/webroot/img/products/${product_image}`}
                    alt={product_image}
                    // style={{ minHeight: "100%" }}
                  />
                </div>
              );
            })
          ) : (
            <div className="">
              <img
                className="object-cover w-full h-full"
                src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}`}
                alt={product?.product_image}
              />
            </div>
          )}
        </Carousel>
      </div>

      <div className="w-7/12 p-4">
        <div className="w-full">
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
          <div className="w-full">
            {currentStep ? (
              currentStep?.map(([key, value], index) => {
                const length = value?.length;
                const founds = [];

                for (let i = 0; i < length; i++) {
                  const found = findIndex(uniqTransformedVariantOptionValue, { ...formData, [key]: value[i]?.property_value });
                  if (found === -1) {
                    founds.push(value[i]?.property_value);
                  }
                }

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

                    <div className="grid grid-cols-3 gap-4 xl:gap-3">
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
                            disabled={founds?.includes(item?.property_value)}
                            formData={formData}
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
                <div className="grid grid-cols-3 gap-4 xl:gap-3">
                  <RenderQuantityTap
                    product={product}
                    productPrice={productPrice}
                    formData={formData}
                    reset={reset}
                    variantQuantity={variantQuantity}
                    variantID={variantID}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductWithVariants;

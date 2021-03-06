import Carousel from "components/Carousel";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";
import { capitalize, find, isEqual, lowerCase, reduce, snakeCase, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const RenderTap = ({ item, product, setProductPrice, step, setStep, setFormData, variantName, setStepsClicked }) => {
  // console.log(item);
  return (
    <button
      className="w-32 h-32 font-bold border border-gray-200 focus:outline-none"
      onClick={() => {
        setStepsClicked((data) => [...data, { step, variantName }]);
        // console.log(variantName);
        // console.log(step);
        setFormData((data) => ({ ...data, [variantName]: item.property_value }));
        if (item?.property_price_set === "YES") {
          setProductPrice(Number(parseFloat(item?.property_price).toFixed(2)));
        } else {
          setProductPrice(Number(parseFloat(product?.product_price).toFixed(2)));
        }
        setStep(step + 1);
      }}
    >
      {item.property_value}
    </button>
  );
};

const RenderQuantityTap = ({ product, productPrice, formData, reset, setStep, setStepsClicked }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const productsInCart = useSelector((state) => state.cart.productsInCart);

  const quantities =
    product?.product_quantity === "-99" || product?.product_quantity === "Unlimited"
      ? [1, 2, 3, 4, 5, 6]
      : [1, 2, 3, 4, 5, 6].slice(0, parseInt(product?.product_quantity));

  React.useEffect(() => {
    if (parseInt(product?.product_quantity) === 0) {
      addToast(`Product sold out`, { appearance: "warning", autoDismiss: true });
      setStep((steps) => steps - 1);
      setStepsClicked((stepsClicked) => stepsClicked.slice(0, -1));
    }
  }, []);

  const submitFormData = (values) => {
    const res = reduce(
      values,
      function (result, value, key) {
        return { ...result, [capitalize(key)]: value };
      },
      {}
    );

    const { Quantity, ...rest } = res;
    const data = {
      ...product,
      id: product.product_id,
      title: product.product_name,
      price: Number(parseFloat(productPrice).toFixed(2)),
      imgURL: product.product_image,
      quantity: Number(Quantity),
      variants: rest,
      variantID: "",
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
      stock_level =
        product?.product_quantity === "-99" || product?.product_quantity === "Unlimited" ? 10000000000000 : parseInt(product?.product_quantity);

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

  if (parseInt(product?.product_quantity) === 0) {
    return <></>;
  }

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

const ProductDetails = ({ onClose }) => {
  const { addToast, removeAllToasts } = useToasts();
  const product = useSelector((state) => state.products.productToView);
  // console.log(product);
  // const variants = Object.values(product.product_properties);
  // const groupVariants = variants.reduce((acc, variant) => {
  //   const found = acc[variant.property_id] || [];
  //   return { ...acc, [variant.property_id]: [...found, variant] };
  // }, {});

  const sortedNewProductProperties = {};
  Object.keys(product.product_properties)
    .sort()
    .forEach(function (v, i) {
      sortedNewProductProperties[v] = product.product_properties[v];
    });
  const allVariants = Object.entries(sortedNewProductProperties);

  // console.log(allVariants);
  const noOfSteps = allVariants.length;

  // Component State
  const [productPrice, setProductPrice] = React.useState(0);
  const [formData, setFormData] = React.useState({});
  const [step, setStep] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState([allVariants[step]]);
  const [variantQuantity, setVariantQuantity] = React.useState(0);
  const [variantID, setVariantID] = React.useState("");

  const [stepsClicked, setStepsClicked] = React.useState([]);

  // console.log(stepsClicked);
  // console.log(formData);

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
      // if (product?.product_properties_variants && product?.product_properties_variants?.length > 0) {
      //   const found = find(product?.product_properties_variants, (o) => {
      //     return isEqual(formData, o?.variantOptionValue);
      //   });
      //   if (!found) {
      //     // const sortedNewValues = {};
      //     // product?.product_properties_variants.sort().forEach(function (v, i) {
      //     //   sortedNewValues[v] = product?.product_properties_variants[v];
      //     // });
      //     const combinations = product?.product_properties_variants?.map((product_property) => {
      //       const sortedNewValues = {};
      //       Object.keys(product_property?.variantOptionValue)
      //         .sort()
      //         .forEach(function (v, i) {
      //           sortedNewValues[v] = product_property?.variantOptionValue[v];
      //         });
      //       return `Variant Combination: ${Object.values(sortedNewValues).join("/")} Price: GHS${product_property?.variantOptionPrice}  Quantity: ${
      //         product_property?.variantOptionQuantity === "-99" ? "Unlimited" : product_property?.variantOptionQuantity
      //       }`;
      //     });
      //     setStep((step) => step - 1);
      //     setStepsClicked((data) => data.slice(0, -1));
      //     addToast(
      //       <div className="w-full">
      //         <p className="text-center text-red-500">{`Product variant combination '${Object.entries(formData)
      //           .map(([key, value]) => `${value}`)
      //           .join("/")}' is not possible`}</p>
      //         <div className="mt-2 text-center text-black">
      //           <p className="font-bold">Available combinations</p>
      //           {combinations.map((combination, index) => {
      //             return (
      //               <p key={index} className="mb-2">
      //                 <span>{index + 1}.</span> <span>{combination}</span>
      //               </p>
      //             );
      //           })}
      //         </div>
      //       </div>,
      //       {
      //         appearance: `info`,
      //         autoDismiss: true,
      //         autoDismissTimeout: 50000,
      //       }
      //     );
      //   } else {
      //     removeAllToasts();
      //     setProductPrice(Number(parseFloat(found?.variantOptionPrice).toFixed(2)));
      //     setVariantQuantity(found?.variantOptionQuantity);
      //     setVariantID(found?.variantOptionId);
      //   }
      // }
    }
  }, [noOfSteps, step]);

  // return null;

  // console.log(stepsClicked, step);

  return (
    <div className="flex w-full rounded-lg overflow-auto" style={{ minHeight: 500, maxHeight: 500 }}>
      <div className="w-5/12">
        {product?.product_images?.length > 1 ? (
          <Carousel showArrows={false} showIndicators={false} showThumbs={false} className="flex flex-col items-center justify-center w-full h-full">
            {product?.product_images?.map((product_image) => {
              return (
                // <div key={product_image} className="">
                //   <img
                //     className="object-cover w-full h-full"
                //     key={product_image}
                //     src={`https://payments.ipaygh.com/app/webroot/img/products/${product_image}`}
                //     alt={product_image}
                //     // style={{ minHeight: "100%" }}
                //   />
                // </div>

                <div key={product_image} className="relative " style={{ paddingBottom: "50%" }}>
                  <img
                    className="absolute h-full w-full object-cover"
                    src={`https://payments.ipaygh.com/app/webroot/img/products/${product_image}`}
                    alt={product_image}
                  />
                </div>
              );
            })}
          </Carousel>
        ) : (
          // <div className="">
          //   <img
          //     className="object-cover w-full h-full"
          //     src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}`}
          //     alt={product?.product_image}
          //   />
          // </div>
          <div className="relative h-full" style={{}}>
            <img
              className="absolute h-full w-full object-center"
              src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}`}
              alt={product?.product_image}
            />
          </div>
        )}
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
                <span className="mr-2 text-sm font-bold">
                  Variant Quantity:{" "}
                  {product?.product_quantity === "-99" || product?.product_quantity === "Unlimited" ? "Unlimited" : product?.product_quantity}
                </span>
              )}
              {step === noOfSteps && <span className="text-sm font-bold">Variant Price: GHS{productPrice}</span>}
            </div>
          </div>

          <hr className="my-2" />
          <div className="w-full pb-4">
            {currentStep ? (
              currentStep?.map(([key, value], index) => {
                // console.log(value);
                return (
                  <div key={key + index} className="w-full h-full ">
                    <div className="flex items-center justify-center w-full">
                      {stepsClicked?.map((stepClicked, index) => {
                        return (
                          <button
                            key={stepClicked?.variantName}
                            className="block mb-2 mr-2 text-sm font-bold tracking-wide text-center text-gray-700 uppercase focus:outline-none"
                            onClick={() => {
                              setStep(stepClicked?.step);
                              const sliced = stepsClicked.slice(0, index);
                              // console.log({ sliced });
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
                            variantName={capitalize(key)}
                            product={product}
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
                    setStep={setStep}
                    setStepsClicked={setStepsClicked}
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

export default ProductDetails;

import { openProductModal } from "features/products/productsSlice";
import { camelCase, get, lowerCase, map, reduce, snakeCase, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "components/Carousel";
import { useForm } from "react-hook-form";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";

const RenderTap = ({ item, propertyName, setProductPrice, step, setStep, setFormData }) => {
  return (
    <button
      className="font-bold border border-gray-200 focus:outline-none w-32 h-32"
      onClick={() => {
        setFormData((data) => ({ ...data, [propertyName]: item.property_value }));
        if (item?.property_price_set === "YES") {
          setProductPrice(Number(parseFloat(item?.property_price).toFixed(2)));
        }
        setStep(step + 1);
      }}
    >
      {item.property_value}
    </button>
  );
};

const RenderQuantityTap = ({ product, productPrice, formData, reset }) => {
  const dispatch = useDispatch();
  const quantities = [1, 2, 3, 4, 5, 6];

  const submitFormData = (values) => {
    const res = reduce(
      values,
      function (result, value, key) {
        return { ...result, [snakeCase(lowerCase(key))]: value };
      },
      {}
    );

    const { quantity, ...rest } = res;
    const data = {
      ...product,
      id: product.product_id,
      title: product.product_name,
      price: Number(parseFloat(productPrice).toFixed(2)),
      imgURL: product.product_image,
      quantity: Number(quantity),
      variants: rest,
    };

    dispatch(increaseTotalItemsInCart(Math.round(Number(res?.quantity))));
    dispatch(addItemToCart(data));
    reset();
  };

  return (
    <>
      {quantities.map((quantity) => {
        return (
          <button
            key={quantity}
            className="font-bold border border-gray-200 focus:outline-none w-32 h-32"
            onClick={() => {
              submitFormData({ ...formData, QUANTITY: quantity });
            }}
          >
            {quantity}
          </button>
        );
      })}
      {/* <div className="flex flex-col justify-center items-center border border-gray-200 w-32 h-32">
          <input
            // type="number"
            placeholder="Enter Quantity"
            className="appearance-none focus:appearance-none font-bold focus:text-4xl text-center w-full h-full "
          ></input>
        </div> */}
    </>
  );
};

const ProductDetails = ({ onClose }) => {
  const product = useSelector((state) => state.products.productToView);
  // const variants = Object.values(product.product_properties);
  // const groupVariants = variants.reduce((acc, variant) => {
  //   const found = acc[variant.property_id] || [];
  //   return { ...acc, [variant.property_id]: [...found, variant] };
  // }, {});

  const allVariants = Object.entries(product.product_properties);

  // console.log(product);
  // console.log(allVariants);
  const noOfSteps = allVariants.length;

  // Component State
  const [productPrice, setProductPrice] = React.useState(0);
  const [formData, setFormData] = React.useState({});
  const [step, setStep] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState([allVariants[step]]);

  // console.log(currentStep);
  // console.log(formData);

  const reset = () => {
    onClose();
    setStep(0);
    setFormData({});
    setProductPrice(0);
    setCurrentStep([allVariants[0]]);
  };

  React.useEffect(() => {
    if (step <= noOfSteps - 1) {
      setCurrentStep([allVariants[step]]);
    } else {
      setCurrentStep(null);
    }
  }, [noOfSteps, step]);

  // return null;

  return (
    <div className="flex w-full" style={{ maxHeight: 500 }}>
      <div className="w-4/12 flex items-center overflow-hidden m-2">
        <div className="w-full items-center overflow-hidden">
          <Carousel showArrows={false}>
            {product?.product_images?.map((product_image) => {
              return (
                <div key={product_image} className="overflow-hidden">
                  <img
                    className=""
                    key={product_image}
                    src={`https://payments.ipaygh.com/app/webroot/img/products/${product_image}`}
                    alt={product_image}
                    style={{ maxHeight: 200 }}
                  />
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>

      <div className="w-8/12 p-4">
        <div className="w-full">
          <div className="text-center">
            <p className="font-bold ">
              <span className="text-xl mr-4">{upperCase(product.product_name)}</span>
            </p>
            <p className="text-sm">Product ID: {product.product_id}</p>
          </div>

          <hr className="my-2" />
          <div className="w-full">
            {currentStep ? (
              currentStep?.map((variant) => {
                return (
                  <div key={variant[0]} className="w-full h-full">
                    <p className="block uppercase tracking-wide text-gray-700 text-center font-bold mb-2">{variant[0]}</p>
                    <div key={variant?.property_value} className="grid grid-cols-4 xl:grid-cols-4 gap-2 xl:gap-2">
                      {variant[1].map((item) => {
                        return (
                          <RenderTap
                            key={item?.property_value}
                            propertyName={variant[0]}
                            item={item}
                            setProductPrice={setProductPrice}
                            setStep={setStep}
                            step={step}
                            setFormData={setFormData}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full">
                <p className="block uppercase tracking-wide text-gray-700 text-center font-bold mb-2">Quantity</p>
                <div className="grid grid-cols-4 xl:grid-cols-4 gap-2 xl:gap-2">
                  <RenderQuantityTap product={product} productPrice={productPrice} formData={formData} reset={reset} />
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

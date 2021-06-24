import { openProductModal } from "features/products/productsSlice";
import { camelCase, get, lowerCase, map, reduce, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "components/Carousel";
import { useForm } from "react-hook-form";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";

const initialFormData = {};

const RenderTap = ({ item, setProductPrice, step, setStep, setFormData }) => {
  return (
    <div className="flex flex-col justify-center items-center border border-gray-200 w-32 h-32">
      <button
        className="font-bold w-full h-full focus:outline-none"
        onClick={() => {
          setFormData((data) => ({ ...data, [item.property_id]: item.property_value }));
          if (item?.property_price_set === "YES") {
            setProductPrice(Number(parseFloat(item?.property_price).toFixed(2)));
          }
          setStep(step + 1);
        }}
      >
        {item.property_value}
      </button>
    </div>
  );
};

const RenderQuantityTap = ({ product, productPrice, formData, reset }) => {
  const dispatch = useDispatch();
  const quantities = [1, 2, 3, 4, 5, 6];

  const submitFormData = (values) => {
    const res = reduce(
      values,
      function (result, value, key) {
        return { ...result, [lowerCase(key)]: value };
      },
      {}
    );
    const { quantity, ...rest } = res;
    const data = {
      id: product.product_id,
      title: product.product_name,
      price: Number(parseFloat(productPrice).toFixed(2)),
      imgURL: product.product_image,
      quantity: Number(quantity),
      variants: rest,
    };

    // console.log(data);
    // return;

    dispatch(increaseTotalItemsInCart(Math.round(Number(res?.quantity))));
    dispatch(addItemToCart(data));
    reset();
  };

  return (
    <div className="px-3 mb-6 w-full">
      <p className="block uppercase tracking-wide text-gray-700 text-center font-bold mb-6">Quantity</p>
      <div className="grid grid-cols-4 gap-2">
        {quantities.map((quantity) => {
          return (
            <div key={quantity} className="flex flex-col justify-center items-center border border-gray-200 w-32 h-32">
              <button
                className="font-bold w-full h-full focus:outline-none"
                onClick={() => {
                  submitFormData({ ...formData, QUANTITY: quantity });
                }}
              >
                {quantity}
              </button>
            </div>
          );
        })}
        {/* <div className="flex flex-col justify-center items-center border border-gray-200 w-32 h-32">
          <input
            // type="number"
            placeholder="Enter Quantity"
            className="appearance-none focus:appearance-none font-bold focus:text-4xl text-center w-full h-full "
          ></input>
        </div> */}
      </div>
    </div>
  );
};

const ProductDetails = ({ onClose }) => {
  const product = useSelector((state) => state.products.productToView);
  const variants = Object.values(product.product_properties);
  const groupVariants = variants.reduce((acc, variant) => {
    const found = acc[variant.property_id] || [];
    return { ...acc, [variant.property_id]: [...found, variant] };
  }, {});

  const allVariants = Object.entries(groupVariants);
  const noOfSteps = allVariants.length;

  // Component State
  const [productPrice, setProductPrice] = React.useState(0);
  const [formData, setFormData] = React.useState({});
  const [step, setStep] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState([allVariants[step]]);

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

  return (
    <div className="relative flex w-full max-w-6xl rounded-lg  bg-white border border-gray-200" style={{ maxHeight: 500 }}>
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
                    <img className="" key={product_image} src={product_image} alt={product_image} style={{ maxHeight: 200 }} />
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
            <div className="w-full px-10">
              <div className="flex flex-wrap justify-between">
                {currentStep ? (
                  currentStep?.map((variant) => {
                    return (
                      <div key={variant[0]} className="px-3 mb-6 w-full">
                        <p className="block uppercase tracking-wide text-gray-700 text-center font-bold mb-6">{variant[0]}</p>
                        <div key={variant?.property_value} className="grid grid-cols-4 gap-2">
                          {variant[1].map((item) => {
                            return (
                              <RenderTap
                                key={item?.property_value}
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
                  <RenderQuantityTap product={product} productPrice={productPrice} formData={formData} reset={reset} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

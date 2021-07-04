import Carousel from "components/Carousel"
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice"
import { lowerCase, reduce, snakeCase, upperCase } from "lodash"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useToasts } from "react-toast-notifications"

const RenderTap = ({ item, propertyName, setProductPrice, step, setStep, setFormData, variantName, setStepsClicked }) => {
  return (
    <button
      className="font-bold border border-gray-200 focus:outline-none w-32 h-32"
      onClick={() => {
        setStepsClicked((data) => [...data, { step, variantName }])
        // console.log(variantName);
        // console.log(step);
        setFormData((data) => ({ ...data, [propertyName]: item.property_value }))
        if (item?.property_price_set === "YES") {
          setProductPrice(Number(parseFloat(item?.property_price).toFixed(2)))
        }
        setStep(step + 1)
      }}>
      {item.property_value}
    </button>
  )
}

const RenderQuantityTap = ({ product, productPrice, formData, reset }) => {
  const dispatch = useDispatch()
  const { addToast } = useToasts()
  const productsInCart = useSelector((state) => state.cart.productsInCart)

  const quantities = [1, 2, 3, 4, 5, 6]

  const submitFormData = (values) => {
    const res = reduce(
      values,
      function (result, value, key) {
        return { ...result, [snakeCase(lowerCase(key))]: value }
      },
      {}
    )

    const { quantity, ...rest } = res
    const data = {
      ...product,
      id: product.product_id,
      title: product.product_name,
      price: Number(parseFloat(productPrice).toFixed(2)),
      imgURL: product.product_image,
      quantity: Number(quantity),
      variants: rest
    }

    dispatch(increaseTotalItemsInCart(Math.round(Number(res?.quantity))))
    dispatch(addItemToCart(data))
    reset()
  }

  const checkProductQuantity = (product, quantity) => {
    try {
      // console.log(product);
      const stock_level =
        product?.product_quantity === "-99"
          ? 10000000000000
          : parseInt(product?.product_quantity)
      const productSoldOut = stock_level <= 0

      if (productSoldOut) {
        return addToast(`Product sold out`, { appearance: "warning", autoDismiss: true })
      }

      const foundProduct = productsInCart?.find((productInCart) => productInCart?.product_id === product?.product_id)
      // console.log(foundProduct);

      //if not found continue
      if (foundProduct) {
        const isQuantitySelectedUnAvailable = foundProduct?.quantity + quantity > stock_level
        // console.log(isQuantitySelectedUnAvailable);

        if (isQuantitySelectedUnAvailable) {
          return addToast(`Quantity is not available, ${stock_level} item(s) already added to cart. Available quantity is ${stock_level}`, {
            appearance: "warning",
            autoDismiss: true
          })
        }
        submitFormData({ ...formData, QUANTITY: quantity })
      } else {
        const isQuantitySelectedUnAvailable = quantity > stock_level
        if (isQuantitySelectedUnAvailable) {
          return addToast(`Quantity is not availble, available quantity is ${stock_level}`, { appearance: "warning", autoDismiss: true })
        }
        submitFormData({ ...formData, QUANTITY: quantity })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {quantities.map((quantity) => {
        return (
          <button
            key={quantity}
            className="font-bold border border-gray-200 focus:outline-none w-32 h-32"
            onClick={() => {
              checkProductQuantity(product, quantity) //check stock quantity before add to cart
            }}>
            {quantity}
          </button>
        )
      })}
      {/* <div className="flex flex-col justify-center items-center border border-gray-200 w-32 h-32">
          <input
            // type="number"
            placeholder="Enter Quantity"
            className="appearance-none focus:appearance-none font-bold focus:text-4xl text-center w-full h-full "
          ></input>
        </div> */}
    </>
  )
}

const ProductDetails = ({ onClose }) => {
  const product = useSelector((state) => state.products.productToView)
  // const variants = Object.values(product.product_properties);
  // const groupVariants = variants.reduce((acc, variant) => {
  //   const found = acc[variant.property_id] || [];
  //   return { ...acc, [variant.property_id]: [...found, variant] };
  // }, {});

  const allVariants = Object.entries(product.product_properties)

  // console.log(product);
  // console.log(allVariants);
  const noOfSteps = allVariants.length

  // Component State
  const [productPrice, setProductPrice] = React.useState(0)
  const [formData, setFormData] = React.useState({})
  const [step, setStep] = React.useState(0)
  const [currentStep, setCurrentStep] = React.useState([allVariants[step]])

  const [stepsClicked, setStepsClicked] = React.useState([])

  // console.log(stepsClicked);
  // console.log(formData);

  const reset = () => {
    onClose()
    setStep(0)
    setFormData({})
    setProductPrice(0)
    setCurrentStep([allVariants[0]])
  }

  React.useEffect(() => {
    if (step <= noOfSteps - 1) {
      setCurrentStep([allVariants[step]])
    } else {
      setCurrentStep(null)
    }
  }, [noOfSteps, step])

  // return null;

  return (
    <div className="flex w-full rounded-lg" style={{ maxHeight: 500 }}>
      <div className="w-5/12">
        <Carousel
          showArrows={false}
          showIndicators={false}
          showThumbs={false}
          className="flex flex-col justify-center items-center w-full h-full">
          {product?.product_images?.map((product_image) => {
            return (
              <div key={product_image} className="">
                <img
                  className="h-full w-full object-cover"
                  key={product_image}
                  src={`https://payments.ipaygh.com/app/webroot/img/products/${product_image}`}
                  alt={product_image}
                  // style={{ maxHeight: 400 }}
                />
              </div>
            )
          })}
        </Carousel>
      </div>

      <div className="w-7/12 p-4">
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
                    <div className="flex justify-center items-center w-full">
                      {stepsClicked?.map((stepClicked) => {
                        return (
                          <button
                            onClick={() => {
                              setStep(stepClicked?.step)
                              const filtered = stepsClicked.filter((clicked) => clicked?.variantName !== stepClicked?.variantName)
                              setStepsClicked(filtered)
                            }}
                            key={stepClicked?.variantName}
                            className="block uppercase tracking-wide text-gray-700 text-center text-sm font-bold mb-2 mr-2 focus:outline-none">
                            <span className="border-b-2 border-blue-500">{stepClicked?.variantName}</span>
                            <span> {">"}</span>
                          </button>
                        )
                      })}
                      <p className="block uppercase tracking-wide text-gray-700 text-center text-sm font-bold mb-2">{variant[0]}</p>
                    </div>
                    <div key={variant?.property_value} className="grid grid-cols-4 xl:grid-cols-3 gap-2 xl:gap-5">
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
                            setStepsClicked={setStepsClicked}
                            variantName={variant[0]}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="w-full h-full">
                <div className="flex justify-center items-center w-full">
                  {stepsClicked?.map((stepClicked) => {
                    return (
                      <button
                        onClick={() => {
                          setStep(stepClicked?.step)
                          const filtered = stepsClicked.filter((clicked) => clicked?.variantName !== stepClicked?.variantName)
                          setStepsClicked(filtered)
                        }}
                        key={stepClicked?.variantName}
                        className="block uppercase tracking-wide text-gray-700 text-center text-sm font-bold mb-2 mr-2 focus:outline-none ">
                        <span className="border-b-2 border-blue-500">{stepClicked?.variantName}</span>
                        <span> {">"}</span>
                      </button>
                    )
                  })}

                  <p className="block uppercase tracking-wide text-gray-700 text-center text-sm font-bold mb-2">Quantity</p>
                </div>
                <div className="grid grid-cols-4 xl:grid-cols-3 gap-2 xl:gap-5">
                  <RenderQuantityTap product={product} productPrice={productPrice} formData={formData} reset={reset} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails

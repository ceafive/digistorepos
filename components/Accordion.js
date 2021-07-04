import {
  addItemToCart,
  changeItemPropsInCart,
  increaseTotalItemsInCart,
  removeItemFromCart,
  setActivePayments,
} from "features/cart/cartSlice";
import { openInventoryModal, setProductToView } from "features/products/productsSlice";
import { capitalize, lowerCase } from "lodash";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const Accordion = ({ product, index }) => {
  // console.log(product);
  const { addToast } = useToasts();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const productsInCart = useSelector((state) => state.cart.productsInCart);

  const [isActive, setIsActive] = useState(false);

  const checkProductQuantity = (product, value) => {
    try {
      // console.log(productsInCart);
      let status = true;
      const stock_level =
        product?.product_quantity === "-99"
          ? 10000000000000
          : parseInt(product?.product_quantity) - parseInt(product?.product_quantity_sold);
      const productSoldOut = stock_level <= 0;

      if (productSoldOut) {
        addToast(`Product sold out`, { appearance: "error", autoDismiss: true });
        status = false;
      }

      const isQuantitySelectedUnAvailable = value > stock_level;
      // console.log(isQuantitySelectedUnAvailable);

      if (isQuantitySelectedUnAvailable) {
        addToast(`Quantity is not availble, available quantity is ${stock_level}`, { appearance: "error", autoDismiss: true });
        status = false;
      }
      return { status, stock_level };
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnChange = (field, value) => {
    if (field === "quantity") {
      const { status, stock_level } = checkProductQuantity(product, parseInt(value));

      if (status) {
        dispatch(
          changeItemPropsInCart({
            ...product,
            [field]: value,
          })
        );
      } else {
        dispatch(
          changeItemPropsInCart({
            ...product,
            [field]: stock_level,
          })
        );
      }
    } else {
      dispatch(
        changeItemPropsInCart({
          ...product,
          [field]: value,
        })
      );
    }
  };

  return (
    <div className={`${isActive ? "border-l-2 border-green-700 bg-gray-100" : ""} `}>
      <div className="w-full flex py-3 px-2">
        <div className="mr-2 font-bold cursor-pointer" onClick={() => setIsActive(!isActive)}>
          {isActive ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-right"></i>}
        </div>

        <div className="flex justify-between w-full">
          {/* Item Name */}
          <div className="flex cursor-pointer" onClick={() => setIsActive(!isActive)}>
            <span className="mr-1">{index + 1}.</span>
            <div>
              <span className="font-bold">{product.title?.substring(0, 20)}</span>
              {product.variants && (
                <div className="flex">
                  {Object.entries(product?.variants).map((variant, index) => {
                    return (
                      <p key={variant[0]} className="text-xs font-semibold m-0 p-0">
                        <span>{capitalize(variant[1])}</span>
                        {index !== Object.entries(product?.variants).length - 1 && <span>/ </span>}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {/* Item Name */}

          {/* Amount and Delete */}
          <div className="font-bold">
            <span className="mr-1">GHS{Number(parseFloat(product.totalPrice).toFixed(2))}</span>
            <button
              className="justify-self-end focus:outline-none"
              onClick={() => {
                dispatch(removeItemFromCart(product?.uniqueId));
              }}
            >
              <i className="fas fa-trash-alt text-red-500 text-sm"></i>
            </button>
          </div>

          {/* Amount and Delete */}
        </div>
      </div>

      {isActive && (
        <div className="accordion-content pb-4 px-2">
          <div className="flex flex-between">
            <div className="mr-2">
              <label htmlFor="quantity" className="text-sm font-bold">
                Quantity
              </label>
              <input
                id="quantity"
                value={product.quantity}
                onChange={(e) => {
                  e.persist();
                  handleOnChange("quantity", e.target.value);
                }}
                type="number"
                placeholder="eg. 0"
                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
              />
            </div>

            <div className="mr-2">
              <label htmlFor="price" className="text-sm font-bold">
                Price
              </label>
              <input
                id="price"
                disabled
                readOnly
                value={product.price}
                type="number"
                placeholder="eg. 0"
                className="border-0 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
              />
            </div>

            <div className="">
              <label htmlFor="price" className="text-sm font-bold">
                Discount %
              </label>
              <input
                id="discount"
                value={product.discount}
                onChange={(e) => {
                  e.persist();
                  handleOnChange("discount", e.target.value);
                }}
                type="number"
                max={100}
                maxLength={3}
                placeholder="eg. 0"
                className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full "
              />
            </div>
          </div>

          {/* <div className="mt-2">
            <label htmlFor="price" className="text-sm font-bold">
              Notes
            </label>
            <input
              value={product.notes}
              onChange={(e) => {
                e.persist();
                handleOnChange("notes", e.target.value);
              }}
              id="notes"
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full"
            />
          </div> */}

          <div className="text-right">
            <button
              className="text-xs text-blue-500 focus:outline-none"
              onClick={() => {
                dispatch(setProductToView(product));
                dispatch(openInventoryModal());
              }}
            >
              <span>
                <i className="fas fa-info-circle mr-1"></i>
              </span>
              <span>Show details</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accordion;

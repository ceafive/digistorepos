import { changeItemPropsInCart, removeItemFromCart } from "features/cart/cartSlice";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { openInventoryModal, setProductToView } from "features/products/productsSlice";

const Accordion = ({ product, index }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);

  const handleOnChange = (field, value) => {
    dispatch(
      changeItemPropsInCart({
        ...product,
        [field]: value,
      })
    );
  };

  return (
    <div className={`${isActive ? "border-l-2 border-green-500 bg-gray-100" : ""} `}>
      <div className="w-full flex py-3 px-2">
        <div className="mr-2 font-bold cursor-pointer" onClick={() => setIsActive(!isActive)}>
          {isActive ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-right"></i>}
        </div>
        <div className="flex justify-between w-full">
          <div>
            <span className="mr-1">{index + 1}.</span>
            <span className="font-bold">{product.title.substring(0, 20)}</span>
          </div>
          <div className="font-bold">
            <span className="mr-1">GHS{Number(parseFloat(product.totalPrice).toFixed(2))}</span>
            <button
              className="justify-self-end focus:outline-none"
              onClick={() => {
                console.log("clicked");
                dispatch(removeItemFromCart(product.title));
              }}
            >
              <i className="fas fa-trash-alt text-red-500 text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="accordion-content pb-4 px-2">
          <div className="flex flex-between">
            <div className="mr-2">
              <label htmlFor="quantity" className="font-bold">
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
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring w-full "
              />
            </div>

            <div className=" mr-2">
              <label htmlFor="price" className="font-bold">
                Price
              </label>
              <input
                id="price"
                disabled
                readOnly
                value={product.price}
                type="number"
                placeholder="eg. 0"
                className="border-0 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring w-full "
              />
            </div>
            <div className="">
              <label htmlFor="discount" className="font-bold">
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
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring w-full "
              />
            </div>
          </div>

          {/* <div className="mt-2">
            <label htmlFor="notes" className="font-bold">
              Notes
            </label>
            <input
              id="notes"
              type="text"
              placeholder="eg. 0"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring w-full "
            />
          </div> */}
          <div className="mt-2 text-right">
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
              <span>Show inventory &amp; details</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accordion;

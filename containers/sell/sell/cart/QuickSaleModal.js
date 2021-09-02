import axios from "axios";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";

const QuickSaleModal = ({ onClose }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm();

  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);
  const [processing, setProcessing] = React.useState(false);

  //   console.log(user);
  const addQuickSaleToCart = async (values) => {
    try {
      //   console.log(values);
      const id = Date.now();
      setProcessing(true);
      dispatch(increaseTotalItemsInCart());
      dispatch(
        addItemToCart({
          product_id: id,
          id,
          title: values?.name,
          price: values?.price,
          product_category: "Quick Sale",
          product_image: "digiproduct-bg.png",
          imgURL: "digiproduct-bg.png",
          product_name: values?.name,
          product_price: `${values?.price}`,
          product_has_property: "NO",
          merchant_name: user?.user_merchant_id,
          product_quantity: "-99",
        })
      );
      reset({
        name: "",
        price: "",
      });
      //   onClose();
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      console.log(errorResponse);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full p-5">
      <div className="flex flex-wrap mb-6">
        <div className="w-full">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Item Name</label>
          <input
            className="block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
            {...register("name", { required: "Please enter name of item" })}
            type="text"
            placeholder="Chicken Pops"
          />
          <p className="text-xs italic text-red-500 mb-3">{errors?.name?.message}</p>
        </div>

        <div className="w-full">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Item Price</label>
          <input
            className="block w-full px-4 py-3  leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
            {...register("price", {
              required: `Price is required`,
            })}
            type="numbber"
            placeholder="10"
          />
          <p className="text-xs italic text-red-500 mb-3">{errors?.price?.message}</p>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          disabled={processing}
          className={`${
            processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
          } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
          onClick={() => {
            handleSubmit(addQuickSaleToCart)();
          }}
        >
          {processing && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width="10" height="10" />
            </div>
          )}
          <span>Add To Cart</span>
        </button>
      </div>
    </div>
  );
};

export default QuickSaleModal;

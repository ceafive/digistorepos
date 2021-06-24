import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { addCustomer } from "features/cart/cartSlice";

const AddCustomerModal = ({ onClose, setStep }) => {
  const dispatch = useDispatch();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [processing, setProcessing] = React.useState(false);

  const sumbitToServer = async (values) => {
    try {
      setProcessing(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const userData = {
        client_name: values?.fullName,
        client_email: values?.email,
        client_dob: format(new Date(values?.dob), "dd-MM"),
        client_phone: values?.phone,
        client_merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      const response = await axios.post("/api/products/add-customer", userData);
      const { status, message } = await response.data;

      if (status === 0 || status === 91) {
        const getCustomerRes = await axios.post("/api/products/get-customer", { phoneNumber: userData?.client_phone });
        const { data } = await getCustomerRes.data;
        dispatch(addCustomer(data));
        setStep(2);
      }

      reset({
        fullName: "",
        email: "",
        dob: "",
        phone: "",
      });
    } catch (error) {
      console.log(error);
      setProcessing(false);
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="relative flex w-full max-w-3xl rounded-lg  bg-white border border-gray-200">
        <button className="absolute right-0 top-0 p-2 text-2xl focus:outline-none text-red-500" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="w-full p-10">
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                Full Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                {...register("fullName", { required: "Please enter a name" })}
                type="text"
                placeholder="Jane"
              />
              <p className="text-red-500 text-xs italic">{errors?.fullName?.message}</p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Email</label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                {...register("email", { required: "Please enter an email" })}
                type="email"
                placeholder="jane_doe@mail.com"
              />
              <p className="text-red-500 text-xs italic">{errors?.email?.message}</p>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-2">
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-city">
                Phone
              </label>
              <input
                {...register("phone", { required: "Please enter a phone number" })}
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="number"
                placeholder="Albuquerque"
              />
              <p className="text-red-500 text-xs italic">{errors?.phone?.message}</p>
            </div>
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2" htmlFor="grid-city">
                Date Of Birth
              </label>
              <input
                {...register("dob", { required: "Please enter a date of birth" })}
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="date"
                placeholder="Albuquerque"
              />
              <p className="text-red-500 text-xs italic">{errors?.dob?.message}</p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              disabled={processing}
              className={`${
                processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
              } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
              onClick={() => {
                handleSubmit(sumbitToServer)();
              }}
            >
              {processing && (
                <div className="inline-block mr-2">
                  <Spinner type={"TailSpin"} color="black" width="10" height="10" />
                </div>
              )}
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;

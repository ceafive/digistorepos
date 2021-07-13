import axios from "axios";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import { addCustomer } from "features/cart/cartSlice";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

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

      const response = await axios.post("/api/sell/add-customer", userData);
      const { status, message } = await response.data;

      if (status === 0 || status === 91) {
        const getCustomerRes = await axios.post("/api/sell/get-customer", { phoneNumber: userData?.client_phone });
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
    <div className="w-full p-5">
      <div className="flex flex-wrap mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Full Name</label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            {...register("fullName", { required: "Please enter a name" })}
            type="text"
            placeholder="Kofi Adomah"
          />
          <p className="text-red-500 text-xs italic">{errors?.fullName?.message}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Email</label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            {...register("email")}
            type="email"
            placeholder="kofi_adomah@mail.com"
          />
          <p className="text-red-500 text-xs italic">{errors?.email?.message}</p>
        </div>
      </div>

      <div className="flex flex-wrap mb-2">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Phone</label>
          <input
            {...register("phone", {
              required: "Please enter a phone number",
              validate: (value) => value?.length === 10 || "Phone number should be equal to 10 digits",
            })}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            placeholder="0222442455"
          />
          <p className="text-red-500 text-xs italic">{errors?.phone?.message}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">Date Of Birth</label>
          <input
            {...register("dob")}
            className="appearance-none block w-full text-sm bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="date"
            placeholder="06/06/1957"
          />
          <p className="text-red-500 text-xs italic">{errors?.dob?.message}</p>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          disabled={processing}
          className={`${
            processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
          } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
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
  );
};

export default AddCustomerModal;

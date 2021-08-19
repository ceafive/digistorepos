import axios from "axios";
import Spinner from "components/Spinner";
import { format } from "date-fns";
import { addCustomer } from "features/cart/cartSlice";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";

const AddCustomerModal = ({ onClose, functionToRun = () => {} }) => {
  const { addToast } = useToasts();
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
        client_phone: values?.phone,
        client_merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      if (values?.email) userData["client_email"] = values?.email;
      if (values?.dob) userData["client_dob"] = format(new Date(values?.dob), "dd-MM");

      const response = await axios.post("/api/sell/sell/add-customer", userData);
      const { status, message } = await response.data;

      addToast(message, { autoDismiss: true });

      if (Number(status) === 0 || Number(status) === 91) {
        const getCustomerRes = await axios.post("/api/sell/sell/get-customer", { phoneNumber: userData?.client_phone });
        const { data } = await getCustomerRes.data;
        functionToRun(data);
      }

      reset({
        fullName: "",
        email: "",
        dob: "",
        phone: "",
      });
      onClose();
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
        <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Full Name</label>
          <input
            className="block w-full px-4 py-3 mb-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
            {...register("fullName", { required: "Please enter a name" })}
            type="text"
            placeholder="Kofi Adomah"
          />
          <p className="text-xs italic text-red-500">{errors?.fullName?.message}</p>
        </div>
        <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Email</label>
          <input
            className="block w-full px-4 py-3 mb-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
            {...register("email")}
            type="email"
            placeholder="kofi_adomah@mail.com"
          />
          <p className="text-xs italic text-red-500">{errors?.email?.message}</p>
        </div>
      </div>

      <div className="flex flex-wrap mb-2">
        <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Phone</label>
          <input
            {...register("phone", {
              required: "Please enter a phone number",
              validate: (value) => value?.length === 10 || "Phone number should be equal to 10 digits",
            })}
            className="block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            placeholder="0222442455"
          />
          <p className="text-xs italic text-red-500">{errors?.phone?.message}</p>
        </div>
        <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-700 uppercase">Date Of Birth</label>
          <input
            {...register("dob")}
            className="block w-full px-4 py-3 text-sm leading-tight text-gray-700 bg-gray-200 border border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
            type="date"
            placeholder="06/06/1957"
          />
          <p className="text-xs italic text-red-500">{errors?.dob?.message}</p>
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

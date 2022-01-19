import Spinner from "components/Spinner";
import React from "react";
import { useForm } from "react-hook-form";

const AddNewVariantValue = ({ processing, action }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="w-full p-5">
      <div className="w-full mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Property Values (Seperated by commas (","))</label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
          {...register("variantValues", { required: "Please enter variant values" })}
          type="text"
          placeholder="eg. Small,Big,Large"
        />
        <p className="text-red-500 text-left text-xs italic mt-1">{errors?.variantValues?.message}</p>
      </div>

      <div className="flex justify-center">
        <button
          disabled={processing}
          className={`${
            processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
          } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
          onClick={() => {
            handleSubmit(action)();
          }}
        >
          {processing && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width="10" height="10" />
            </div>
          )}
          <span>{`Add Variant Value`}</span>
        </button>
      </div>
    </div>
  );
};

export default AddNewVariantValue;

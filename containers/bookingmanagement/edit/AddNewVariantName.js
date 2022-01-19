import Spinner from "components/Spinner";
import React from "react";
import { useForm } from "react-hook-form";

const AddNewVariantName = ({ processing, action }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="w-full p-5">
      <div className="w-full mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Property Name</label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
          {...register("variantName", {
            required: "Please enter a variant name",
            validate: (value) => !value.includes(",") || "YYou can only add 1 variant value at a time. Remove commas and try again",
          })}
          type="text"
          placeholder="eg. Size"
        />
        <p className="text-red-500 text-left text-xs italic mt-1">{errors?.variantName?.message}</p>
      </div>

      <div className="w-full mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Variant Value</label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
          {...register("variantValue", {
            required: "Please enter a variant value",
            validate: (value) => !value.includes(",") || "You can only add 1 variant value at a time. Remove commas and try again",
          })}
          type="text"
          placeholder="eg. Small"
        />
        <p className="text-red-500 text-left text-xs italic mt-1">{errors?.variantValue?.message}</p>
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
          <span>{`Add New Variant`}</span>
        </button>
      </div>
    </div>
  );
};

export default AddNewVariantName;

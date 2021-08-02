import Spinner from "components/Spinner";
import React from "react";

const AddCategory = ({
  btnText = "Add New Category",
  processing,
  addCategoryRegister,
  addCategoryErrors,
  addCategoryHandleSumbit,
  action,
}) => {
  return (
    <div className="w-full p-5">
      <div className="w-full px-3 mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Category Name</label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
          {...addCategoryRegister("categoryName", { required: "Please enter a category name" })}
          type="text"
          placeholder="Luxury"
        />
        <p className="text-red-500 text-left text-xs italic mt-1">{addCategoryErrors?.categoryName?.message}</p>
      </div>
      <div className="w-full px-3 mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Category Description</label>
        <textarea
          rows={6}
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          {...addCategoryRegister("categoryDescription")}
        />
      </div>

      <div className="flex justify-center mt-8">
        <button
          disabled={processing}
          className={`${
            processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
          } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
          onClick={() => {
            addCategoryHandleSumbit(action)();
          }}
        >
          {processing && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width="10" height="10" />
            </div>
          )}
          <span>{btnText}</span>
        </button>
      </div>
    </div>
  );
};

export default AddCategory;

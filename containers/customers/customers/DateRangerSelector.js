import { format, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import React from "react";

const DateRangerSelector = ({ register = () => {}, errors = {}, fetching = false, handleSubmit, handleSubmitQuery }) => {
  return (
    <div className="flex w-full items-center justify-center my-2">
      <div className="flex mr-1">
        <div className="w-full">
          <label className="text-sm leading-none  font-bold">Date Range</label>
          <div className="flex w-full">
            <div className="">
              <input
                className="w-full text-xs"
                defaultValue={format(startOfMonth(new Date()), "yyyy-MM-dd")}
                {...register("startDate", { required: `Start date required`, valueAsDate: true })}
                max={format(new Date(), "yyyy-MM-dd")}
                type="date"
              />
              <p className="text-red-500 text-xs">{errors?.startDate?.message}</p>
            </div>

            <p className="bg-blue-500 px-6 py-2 pt-3 font-bold text-white text-xs">TO</p>

            <div className="">
              <input
                className="w-full text-xs"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                {...register("endDate", { required: `End date required`, valueAsDate: true })}
                type="date"
                // min={format(new Date(), "yyyy-MM-dd")}
              />
              <p className="text-red-500 text-xs">{errors?.endDate?.message}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <button
          disabled={fetching}
          className={`${
            fetching ? `bg-gray-200` : `bg-blue-600 focus:ring focus:ring-blue-500`
          }  px-12 py-3 rounded text-white text-xs font-semibold focus:outline-none mt-5`}
          onClick={handleSubmit(handleSubmitQuery)}
        >
          Query
        </button>
      </div>
    </div>
  );
};

export default DateRangerSelector;

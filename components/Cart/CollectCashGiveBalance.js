import React from "react";
import Spinner from "../Spinner";

const CashPaymentInput = ({ register, errors, cartTotalMinusDiscountPlusTax }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        Enter Cash Received
      </label>
      <input
        type="number"
        {...register("cashReceived", {
          required: "Enter Cash Received",
          validate: (value) =>
            Number(value) >= cartTotalMinusDiscountPlusTax || `Amount entered cannot be be less than GHS${cartTotalMinusDiscountPlusTax}`,
        })}
        className="border border-blue-500 px-3 4 text-lg placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors["cashReceived"]?.message}</p>
    </div>
  );
};

const CollectCashGiveBalance = ({ fetching, register, handleSubmit, errors, cartTotalMinusDiscountPlusTax }) => {
  return (
    <>
      <CashPaymentInput register={register} errors={errors} cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax} />

      <div className="text-center">
        <button
          disabled={fetching}
          className={`${
            fetching ? "bg-gray-300 text-gray-200" : "bg-green-700 text-white"
          } font-bold px-3 py-3  rounded focus:outline-none ease-linear transition-all duration-150`}
          type="button"
          onClick={() => {
            // handleSubmit(onAddPayment)();
            handleSubmit((values) => console.log(values))();
          }}
        >
          {fetching && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width={10} height={10} />
            </div>
          )}
          Collect Cash
        </button>
      </div>
    </>
  );
};

export default CollectCashGiveBalance;

import React from "react";

import Spinner from "../Spinner";

const CashPaymentInput = ({ paymentMethodSet, register, errors, cartTotalMinusDiscountPlusTax }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        Enter Cash Received
      </label>
      <input
        type="number"
        {...register(paymentMethodSet, {
          required: "Enter Cash Received",
          validate: (value) =>
            Number(value) >= cartTotalMinusDiscountPlusTax || `Amount entered cannot be be less than GHS${cartTotalMinusDiscountPlusTax}`,
        })}
        className="border border-blue-500 px-3 4 text-lg placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors[paymentMethodSet]?.message}</p>
    </div>
  );
};

const MoMoInput = ({ paymentMethodSet, register, lengthOfMobileNumber, errors }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        {`Enter ${
          paymentMethodSet === "MTNMM" ? "MTN Mobile Money" : paymentMethodSet === "VODAC" ? "Vodafone Cash" : " AirtelTigo Money"
        } Number`}
      </label>
      <input
        type="text"
        {...register(paymentMethodSet, {
          required: "Please enter a phone number",
          minLength: {
            value: lengthOfMobileNumber,
            message: "Cannot be shorter than 10 chars",
          },
          maxLength: {
            value: lengthOfMobileNumber,
            message: "Cannot be longer than 10 chars",
          },
        })}
        placeholder="0547748484"
        className="border border-blue-500 px-3 4 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-lg outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors[paymentMethodSet]?.message}</p>
    </div>
  );
};

const OtherPaymentInput = ({ paymentMethodSet, register, errors }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        Enter Customer Phone number or Email Address
      </label>
      <input
        type="text"
        {...register(paymentMethodSet, {
          required: "Please enter details",
        })}
        placeholder="0547748484 or jane_doe@mail.com"
        className="border border-blue-500 px-3 4 text-lg placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors[paymentMethodSet]?.message}</p>
    </div>
  );
};

const CollectUserDetail = ({
  fetching,
  onAddPayment,
  paymentMethodSet,
  register,
  handleSubmit,
  lengthOfMobileNumber,
  errors,
  cartTotalMinusDiscountPlusTax,
}) => {
  // console.log(errors);
  // console.log(cartTotalMinusDiscountPlusTax);
  return (
    <>
      {(paymentMethodSet === "MTNMM" || paymentMethodSet === "TIGOC" || paymentMethodSet === "VODAC") && (
        <MoMoInput paymentMethodSet={paymentMethodSet} register={register} lengthOfMobileNumber={lengthOfMobileNumber} errors={errors} />
      )}

      {paymentMethodSet === "CASH" && (
        <CashPaymentInput
          paymentMethodSet={paymentMethodSet}
          register={register}
          errors={errors}
          cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax}
        />
      )}
      {(paymentMethodSet === "VISAG" || paymentMethodSet === "QRPAY") && (
        <OtherPaymentInput paymentMethodSet={paymentMethodSet} register={register} errors={errors} />
      )}

      <div className="text-center">
        <button
          disabled={fetching}
          className={`${
            fetching ? "bg-gray-300 text-gray-200" : "bg-green-700 text-white"
          } font-bold px-3 py-3  rounded focus:outline-none ease-linear transition-all duration-150`}
          type="button"
          onClick={() => {
            handleSubmit(onAddPayment)();
          }}
        >
          {fetching && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width={10} height={10} />
            </div>
          )}
          Add Payment
        </button>
      </div>
    </>
  );
};

export default CollectUserDetail;

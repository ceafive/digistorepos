import React from "react";

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
        placeholder="eg. 0547748484"
        className="border border-blue-500 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors?.mobileMoneyNumber?.message}</p>
    </div>
  );
};

const OtherPaymentInput = ({ paymentMethodSet, register, errors }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        Enter Customer Phone number Or Email Address
      </label>
      <input
        type="text"
        {...register(paymentMethodSet, {
          required: "Please enter details",
        })}
        placeholder="eg. 0547748484 or jane_doe@mail.com"
        className="border border-blue-500 px-3 py-3 placeholder-blueGray-400 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none w-full"
      />
      <p className="text-red-500 text-sm">{errors?.phoneOrEmailAddress?.message}</p>
    </div>
  );
};

const CollectUserDetail = ({ onAddPayment, paymentMethodSet, register, handleSubmit, lengthOfMobileNumber, errors, onClose }) => {
  //   console.log(errors);
  return (
    <>
      {(paymentMethodSet === "MTNMM" || paymentMethodSet === "TIGOC" || paymentMethodSet === "VODAC") && (
        <MoMoInput paymentMethodSet={paymentMethodSet} register={register} lengthOfMobileNumber={lengthOfMobileNumber} errors={errors} />
      )}

      {(paymentMethodSet === "CASH" || paymentMethodSet === "VISAG" || paymentMethodSet === "QRPAY") && (
        <OtherPaymentInput paymentMethodSet={paymentMethodSet} register={register} errors={errors} />
      )}
      <button
        className="mb-2 bg-green-700 text-white px-4 py-2 rounded shadow font-semibold focus:outline-none"
        onClick={() => {
          handleSubmit(onAddPayment)();
        }}
      >
        Add Payment
      </button>
    </>
  );
};

export default CollectUserDetail;

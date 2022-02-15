import React from "react";

import Spinner from "../../../../components/Spinner";

const CashPaymentInput = ({ paymentMethodSet, register, errors, cartSubTotal }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        Enter Cash Received
      </label>
      <input
        type="number"
        {...register(paymentMethodSet, {
          required: "Enter Cash Received",
          validate: (value) => Number(value) >= cartSubTotal || `Amount entered cannot be be less than GHS${cartSubTotal}`,
        })}
        className="relative w-full px-3 text-lg bg-white border border-blue-700 rounded outline-none 4 placeholder-blueGray-400 text-blueGray-600 focus:outline-none"
      />
      <p className="text-sm text-red-500">{errors[paymentMethodSet]?.message}</p>
    </div>
  );
};

const MoMoInput = ({ paymentMethodSet, register, lengthOfMobileNumber, errors }) => {
  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        {`Enter ${paymentMethodSet === "MTNMM" ? "MTN Mobile Money" : paymentMethodSet === "VODAC" ? "Vodafone Cash" : " AirtelTigo Money"} Number`}
      </label>
      <input
        type="number"
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
        // max="10"
        placeholder={`${paymentMethodSet === "MTNMM" ? "0546646464" : paymentMethodSet === "VODAC" ? "0203454343" : "0274343234"} `}
        className="relative w-full px-3 text-lg bg-white border border-blue-500 rounded outline-none 4 placeholder-blueGray-300 text-blueGray-600 focus:outline-none"
      />
      <p className="text-sm text-red-500">{errors[paymentMethodSet]?.message}</p>
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
        className="relative w-full px-3 text-lg bg-white border border-blue-500 rounded outline-none 4 placeholder-blueGray-400 text-blueGray-600 focus:outline-none"
      />
      <p className="text-sm text-red-500">{errors[paymentMethodSet]?.message}</p>
    </div>
  );
};

const InvPayment = ({ paymentMethodSet, onAddPayment }) => {
  // is is fpr paymentMethodSet === 'INVPAY'
  React.useEffect(() => {
    onAddPayment({ [paymentMethodSet]: "" }); // onAddPayemnt is handlePayment
  }, []);

  return (
    <div className="my-3">
      <label className="mb-2 text-sm" htmlFor="">
        Fetching transaction charge
      </label>
    </div>
  );
};

const CollectUserDetail = ({ fetching, onAddPayment, paymentMethodSet, register, handleSubmit, lengthOfMobileNumber, errors, cartSubTotal }) => {
  // console.log(cartSubTotal);

  return (
    <>
      {(paymentMethodSet === "MTNMM" || paymentMethodSet === "TIGOC" || paymentMethodSet === "VODAC") && (
        <MoMoInput paymentMethodSet={paymentMethodSet} register={register} lengthOfMobileNumber={lengthOfMobileNumber} errors={errors} />
      )}

      {paymentMethodSet === "CASH" && (
        <CashPaymentInput paymentMethodSet={paymentMethodSet} register={register} errors={errors} cartSubTotal={cartSubTotal} />
      )}

      {(paymentMethodSet === "VISAG" || paymentMethodSet === "QRPAY") && (
        <OtherPaymentInput paymentMethodSet={paymentMethodSet} register={register} errors={errors} />
      )}

      {paymentMethodSet === "INVPAY" && <InvPayment paymentMethodSet={paymentMethodSet} onAddPayment={onAddPayment} />}

      {paymentMethodSet !== "INVPAY" && (
        <div className="mb-3 text-center">
          <button
            disabled={fetching}
            className={`${
              fetching ? "bg-gray-300 text-gray-200" : "bg-green-700 text-white"
            } font-bold px-3 py-3  rounded focus:outline-none ease-linear transition-all duration-150`}
            type="button"
            onClick={handleSubmit(onAddPayment)}
          >
            {fetching && (
              <div className="inline-block mr-2">
                <Spinner type={"TailSpin"} color="black" width={10} height={10} />
              </div>
            )}
            Add Payment
          </button>
        </div>
      )}
    </>
  );
};

export default CollectUserDetail;

import { setAmountReceivedFromPayer } from "features/cart/cartSlice";
import React from "react";
import { useDispatch } from "react-redux";

const CashPaymentModal = ({ onClose, payerAmountEntered, cartTotalMinusDiscountPlusTax }) => {
  const dispatch = useDispatch();

  const setAmount = () => {
    dispatch(
      setAmountReceivedFromPayer({
        method: "CASH",
        amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
      })
    );

    onClose();
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="relative text-center w-full max-w-xl p-8 rounded-lg font-semibold bg-white border border-gray-200">
        <button className="absolute right-0 top-0 p-2 text-2xl focus:outline-none text-red-500" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <h1 className="text-4xl ">Collect GHS{cartTotalMinusDiscountPlusTax}</h1>
        <p className="text-gray-500">Quick Cash Payment</p>
        <button className="my-2 bg-green-500 text-white px-4 py-2 rounded shadow font-semibold focus:outline-none" onClick={setAmount}>
          GHS{payerAmountEntered}
        </button>
      </div>
    </div>
  );
};

export default CashPaymentModal;

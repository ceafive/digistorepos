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
      }),
    );

    onClose();
  };

  return (
    <>
      <h1 className="text-4xl ">Collect GHS{cartTotalMinusDiscountPlusTax}</h1>
      <p className="text-gray-500">Quick Cash Payment</p>
      <button className="my-2 bg-green-700 text-white px-4 py-2 rounded shadow font-semibold focus:outline-none" onClick={setAmount}>
        GHS{payerAmountEntered}
      </button>
    </>
  );
};

export default CashPaymentModal;

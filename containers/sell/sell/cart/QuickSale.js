import axios from "axios";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import { addCustomer } from "features/cart/cartSlice";
import debounce from "lodash.debounce";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import AddCustomerModal from "./AddCustomerModal";
import QuickSaleModal from "./QuickSaleModal";

const QuickSale = ({ step, setStep, openQuickSaleModal, setOpenQuickSaleModal }) => {
  const { addToast } = useToasts();
  const {
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();

  return (
    <>
      <Modal open={openQuickSaleModal} onClose={() => setOpenQuickSaleModal(false)} maxWidth="sm">
        <QuickSaleModal
          onClose={() => setOpenQuickSaleModal(false)}
          functionToRun={(data) => {
            dispatch(addCustomer(data));
            setStep(2);
          }}
        />
      </Modal>
      {/* <div className="flex items-center justify-between border border-red-500">
        <div className="w-6/12 mr-2 text-sm">
          <button
            className="px-4 py-3 font-bold text-white bg-blue-800 rounded focus:outline-none"
            onClick={() => {
              addToast(`NOT AVAILABLE`, { autoDismiss: true });
            }}
          >
            Quick Sale
          </button>
        </div>
      </div> */}
    </>
  );
};

export default QuickSale;

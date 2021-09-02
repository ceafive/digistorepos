import Modal from "components/Modal";
import { addCustomer } from "features/cart/cartSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import AddCustomer from "./AddCustomer";
import AddCustomerModal from "./AddCustomerModal";
import PayButton from "./PayButton";
import QuickSale from "./QuickSale";
import QuickSaleModal from "./QuickSaleModal";
import ShowItems from "./ShowItems";

const Cart = () => {
  const dispatch = useDispatch();

  const currentCustomer = useSelector((state) => state.cart.currentCustomer);

  const [step, setStep] = React.useState(0);
  const [openModal, setOpenModal] = React.useState(false);
  const [componentToRender, setComponentToRender] = React.useState(null);

  return (
    <div id="cart-section">
      <Modal open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm">
        {componentToRender === "addCustomerModal" && (
          <AddCustomerModal
            onClose={() => setOpenModal(false)}
            functionToRun={(data) => {
              dispatch(addCustomer(data));
              setStep(2);
            }}
          />
        )}

        {componentToRender === "addQuickSale" && <QuickSaleModal onClose={() => setOpenModal(false)} />}
      </Modal>
      <div className="flex items-center justify-between w-full">
        {!currentCustomer && (
          <div className="w-6/12 mr-2 text-sm">
            <button
              className="w-full px-4 py-3 font-bold text-white rounded focus:outline-none bg-blueGray-800"
              onClick={() => {
                setStep(1);
                // setOpenModal(true);
              }}
            >
              Add Customer
            </button>
          </div>
        )}

        <div className={`text-sm ${currentCustomer ? "w-full" : "w-6/12"} `}>
          <button
            className="w-full px-4 py-3 font-bold text-white bg-blue-800 rounded focus:outline-none"
            onClick={() => {
              setComponentToRender("addQuickSale");
              setOpenModal(true);
            }}
          >
            Quick Sale
          </button>
        </div>
      </div>

      <QuickSale step={step} setStep={setStep} openModal={openModal} setOpenModal={setOpenModal} />
      <AddCustomer step={step} setStep={setStep} setOpenModal={setOpenModal} setComponentToRender={setComponentToRender} />

      <div
        className="flex flex-wrap bg-white w-full h-full shadow-lg rounded p-1 xl:p-2 mt-4"
        // style={{ height: "auto" }}
      >
        <ShowItems />
        <PayButton />
      </div>
    </div>
  );
};

export default Cart;

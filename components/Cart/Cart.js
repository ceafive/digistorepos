import React from "react";
import { useDispatch, useSelector } from "react-redux";

import AddCustomer from "./AddCustomer";
import PayButton from "./PayButton";
import ShowItems from "./ShowItems";

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const salesHistory = useSelector((state) => state.sales.salesHistory);

  return (
    <div id="cart-section">
      {/* <div className="flex flex-wrap justify-between items-center text-sm">
        <div className="py-1">
          <span className="mr-2">
            <i className="fas fa-history"></i>
          </span>
          <button
            className="focus:outline-none font-bold"
            onClick={() => {
              console.log(cart);
              const data = {
                sale_id: salesHistory.length + 1,
                date: new Date().toDateString(),
                outlet_name: "Main",
                user: JSON.parse(sessionStorage.getItem("IPAYPOSUSER")).name,
                receipt_number: uuidv4(),
                customer_name: cart.currentCustomer.name,
                sale_total: cart.cartTotalMinusDiscountPlusTax,
                status: "Parked",
              };

              console.log(data);
              // dispatch(setSalesHistoryitem([data]));
              // dispatch(onResetCart());
            }}
          >
            <span>Park Sale</span>
          </button>
        </div>
      </div> */}
      <div
        className="flex flex-wrap bg-white w-full h-full shadow-lg rounded p-1 xl:p-2"
        // style={{ height: "auto" }}
      >
        <AddCustomer />
        <ShowItems />
        <PayButton />
      </div>
    </div>
  );
};

export default Cart;

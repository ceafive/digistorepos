import { createPopper } from "@popperjs/core";
import { onAppLogout } from "features/app/appSlice";
import { onAppResetCart } from "features/cart/cartSlice";
import { onAppResetCustomers } from "features/customers/customersSlice";
import { onAppResetManageProducts } from "features/manageproducts/manageproductsSlice";
import { onAppResetSales } from "features/orders/ordersSlice";
import { onAppResetProducts } from "features/products/productsSlice";
import { useRouter } from "next/router";
import React from "react";
import { useDispatch } from "react-redux";

const UserDropdown = () => {
  const dispatch = useDispatch();
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);
  const router = useRouter();
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const onLogout = () => {
    dispatch(onAppLogout());
    dispatch(onAppResetCart());
    dispatch(onAppResetManageProducts());
    dispatch(onAppResetProducts());
    dispatch(onAppResetSales());
    dispatch(onAppResetCustomers());
    sessionStorage.removeItem("IPAYPOSUSER");
  };

  React.useEffect(() => {
    return () => {
      console.log("logging out...");

      if (process.env.NODE_ENV === "production") {
        onLogout();
      }
    };
  }, []);

  return (
    <>
      <div
        className="text-blueGray-500 block cursor-pointer"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center flex">
          <span className="w-10 h-10 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full">
            <img alt="..." className="w-full rounded-full align-middle border-none shadow-lg" src={user?.user_merchant_logo} />
          </span>
        </div>
      </div>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") + "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <button
          className="focus:outline-none text-blueGray-600 px-4 w-full"
          onClick={() => {
            router.push("/auth/login").then(() => {
              onLogout();
            });
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default UserDropdown;

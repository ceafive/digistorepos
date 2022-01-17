import ViewEditABooking from "containers/bookingmanagement/edit/ViewEditABooking";
import ViewEditAProduct from "containers/productmanagement/edit/ViewEditAProduct";
import Admin from "layouts/Admin.js";
import React from "react";

export default function ViewEditProduct() {
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

  const isBooking = user?.user_permissions?.includes("BUKNSMGT") ? true : false || false;

  return isBooking ? <ViewEditABooking /> : <ViewEditAProduct />;
}

ViewEditProduct.layout = Admin;

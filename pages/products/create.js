import CreateABooking from "containers/bookingmanagement/create/CreateABooking";
import CreateAProduct from "containers/productmanagement/create/CreateAProduct";
import Admin from "layouts/Admin.js";
import React from "react";

export default function CreateBooking() {
  let user = sessionStorage.getItem("IPAYPOSUSER");
  user = JSON.parse(user);

  const isBooking = user?.user_permissions?.includes("BUKNSMGT") ? true : false || false;

  return isBooking ? <CreateABooking /> : <CreateAProduct />;
}

CreateBooking.layout = Admin;

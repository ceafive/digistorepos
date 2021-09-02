import ViewEditAProduct from "containers/productmanagement/edit/ViewEditAProduct";
import Admin from "layouts/Admin.js";
import React from "react";

export default function ViewEditProduct() {
  return <ViewEditAProduct />;
}

ViewEditProduct.layout = Admin;

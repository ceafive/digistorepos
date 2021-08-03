import CreateAProduct from "components/ProductsManagement/create/CreateAProduct";
import Admin from "layouts/Admin.js";
import React from "react";

export default function CreateProduct() {
  return <CreateAProduct />;
}

CreateProduct.layout = Admin;

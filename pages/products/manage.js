import ManageProducts from "components/ProductsManagement/ManageProducts";
import Admin from "layouts/Admin";
import React from "react";

export default function Manage() {
  return <ManageProducts />;
}

Manage.layout = Admin;

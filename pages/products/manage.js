import ManageProductsOrCategories from "containers/productmanagement/manage/ManageProductsOrCategories";
import Admin from "layouts/Admin";
import React from "react";

export default function Manage() {
  return <ManageProductsOrCategories />;
}

Manage.layout = Admin;

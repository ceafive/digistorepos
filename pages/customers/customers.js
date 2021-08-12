import CustomersPage from "containers/customers/customers";
import Admin from "layouts/Admin.js";
import React from "react";

const Customers = () => <CustomersPage />;
export default Customers;

Customers.layout = Admin;

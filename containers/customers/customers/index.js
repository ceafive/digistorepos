import axios from "axios";
import Spinner from "components/Spinner";
import { setAllCustomers } from "features/customers/customersSlice";
import { filter } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomersTable from "./CustomersTable";

const CustomersPage = () => {
  const dispatch = useDispatch();
  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [reRUn, setReRUn] = React.useState(new Date());
  // Compnent State

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allCustomerssRes = await axios.post("/api/customers/get-customers", { merchant: user?.user_merchant_id });

        const { data: allCustomerssResData } = await allCustomerssRes.data;
        dispatch(setAllCustomers(filter(allCustomerssResData, Boolean)));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();

    // clear data
    return () => {};
  }, [reRUn]);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h1>Customers</h1>
      <hr />
      <p>Manage your customers and their balances, or segment them by demographics and spending habits.</p>

      <CustomersTable />
    </div>
  );
};

export default CustomersPage;

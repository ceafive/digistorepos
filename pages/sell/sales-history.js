import React from "react";
import SalesHistory from "components/Sell/SalesHistory";
import Admin from "layouts/Admin";
import { useDispatch, useSelector } from "react-redux";
import { setSalesHistoryitem } from "features/sales/salesSlice";

const SalesHistoryPage = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    // dispatch(setSalesHistoryitem([]));
  }, []);

  return (
    <div className="min-h-screen">
      <SalesHistory />
    </div>
  );
};

export default SalesHistoryPage;

SalesHistoryPage.layout = Admin;

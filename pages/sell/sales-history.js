import SalesHistory from "containers/sell/orders/SalesHistory";
import Admin from "layouts/Admin";
import React from "react";
import { useDispatch } from "react-redux";

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

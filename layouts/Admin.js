import React from "react";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";
import withAuth from "components/ProtectRoute";
import { useSelector } from "react-redux";

const Admin = ({ children }) => {
  const openSidebarSecondpane = useSelector((state) => state.app.openSidebarSecondpane);
  return (
    <>
      <Sidebar />
      <div className={`app-main ${openSidebarSecondpane ? "ml-64" : "ml-28"} bg-blueGray-100`}>
        <AdminNavbar />
        <div className="px-10 mx-auto w-full">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
};

export default withAuth(Admin);

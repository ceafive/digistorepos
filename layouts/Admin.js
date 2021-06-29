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
      <div className={`admin-main ${openSidebarSecondpane ? "ml-48 xl:ml-64" : "ml-20 xl:ml-28"} bg-blueGray-100 min-h-screen`}>
        <AdminNavbar />
        <div className="admin-children px-5 mx-auto w-full">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
};

export default withAuth(Admin);

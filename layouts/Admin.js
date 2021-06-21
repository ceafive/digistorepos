import React from "react";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";
import withAuth from "components/ProtectRoute";

const Admin = ({ children }) => {
  return (
    <>
      <Sidebar />
      <div className="app-main ml-80 bg-blueGray-100">
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

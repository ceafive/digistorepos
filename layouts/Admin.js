import FooterAdmin from "components/Footers/FooterAdmin.js";
// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import withAuth from "components/ProtectRoute";
import Sidebar from "components/Sidebar/Sidebar.js";
import React from "react";
import { useSelector } from "react-redux";

const Admin = ({ children }) => {
  const openSidebarSecondpane = useSelector((state) => state.app.openSidebarSecondpane);
  return (
    <div className="font-print">
      <Sidebar />
      <AdminNavbar />
      <div className={`admin-main ${openSidebarSecondpane ? "ml-48 xl:ml-64" : "ml-24 xl:ml-32"} bg-blueGray-100 min-h-screen`}>
        <div className="admin-children px-5 mx-auto w-full">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </div>
  );
};

export default withAuth(Admin);

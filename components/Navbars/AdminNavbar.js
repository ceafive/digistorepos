import React from "react";

import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  return (
    <>
      {/* Navbar */}
      <nav className="w-full z-10 bg-blueGray-800 text-white md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <span className="text-sm uppercase hidden lg:inline-block font-semibold">Dashboard</span>
          {/* User */}
          <div className="flex items-center">
            <button
              className="mr-3 focus:outline-none"
              onClick={() => {
                sessionStorage.removeItem("IPAYPOSUSER");
                router.push("/auth/login");
              }}
            >
              Logout
            </button>
            <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
              <UserDropdown />
            </ul>
          </div>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}

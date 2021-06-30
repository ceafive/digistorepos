import React from "react";
import Admin from "layouts/Admin.js";

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full h-full">
        <p className="font-bold text-6xl">Welcome</p>
      </div>
    </>
  );
}

Dashboard.layout = Admin;

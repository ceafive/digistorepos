import Admin from "layouts/Admin.js";
import React from "react";

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full w-full" style={{ minHeight: "50vh" }}>
        <p className="font-bold text-6xl">Welcome</p>
      </div>
    </>
  );
}

Dashboard.layout = Admin;

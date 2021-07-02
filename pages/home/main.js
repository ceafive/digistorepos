import React from "react";
import Admin from "layouts/Admin.js";

export default function HomeMain() {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full w-full" style={{ minHeight: "50vh" }}>
        <p className="font-bold text-6xl">Welcome</p>
      </div>
    </>
  );
}

HomeMain.layout = Admin;

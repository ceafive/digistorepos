import React from "react";
import Admin from "layouts/Admin.js";

export default function HomeMain() {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full h-full min-h-screen">
        <p className="font-bold text-6xl">Welcome</p>
      </div>
    </>
  );
}

HomeMain.layout = Admin;

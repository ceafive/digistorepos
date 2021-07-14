import UserDropdown from "components/Dropdowns/UserDropdown.js";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function Navbar() {
  const router = useRouter();

  console.log(router);
  return (
    <>
      {/* Navbar */}
      <nav className="w-full z-10 bg-blueGray-800 text-white md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-auto items-center flex justify-end md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}

          <div className="">
            {router?.locales.map((locale) => {
              return (
                <div key={locale} className="text-sm hidden lg:inline-block font-semibold mr-4">
                  <Link href={router.asPath} locale={locale}>
                    <a>{locale}</a>
                  </Link>
                </div>
              );
            })}
          </div>
          {/* User */}
          <div className="flex items-center">
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

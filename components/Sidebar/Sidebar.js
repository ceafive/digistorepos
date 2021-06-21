import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { sidebarRoutes } from "utils/routes";
import { useDispatch, useSelector } from "react-redux";
import { setSecondPaneOpenPath } from "features/app/appSlice";

const NavLink = ({ sidebarRoute }) => {
  const { name, slug, path, icon, iconColor } = sidebarRoute;
  const router = useRouter();
  const dispatch = useDispatch();

  const secondPaneOpenPathname = useSelector(
    (state) => state.app.secondPaneOpenPathname
  );

  return (
    <li
      className={`text-center  ${
        secondPaneOpenPathname === slug ? "bg-white" : ""
      }`}
    >
      <button
        className=" w-full h-full focus:outline-none"
        onClick={() => {
          dispatch(
            setSecondPaneOpenPath({
              name: slug,
            })
          );
        }}
      >
        <span
          className={
            "text-lg py-3 font-bold block " +
            "text-blueGray-700 hover:text-blueGray-500"
          }
        >
          <p>
            <i className={`fas fa-${icon} text-xl text-${iconColor}`}></i>
          </p>
          <p>{name}</p>
        </span>
      </button>
    </li>
  );
};

const ChildNavLink = ({ childLink }) => {
  const { name, path, slug } = childLink;
  const router = useRouter();

  return (
    <li className={`text-left p-3 py-2 font-bold`}>
      <Link href={path}>
        <a className={"font-bold"}>
          <p
            className={
              router.pathname.indexOf(path) !== -1
                ? "text-lightBlue-500 hover:text-lightBlue-600"
                : "text-blueGray-700 hover:text-blueGray-500"
            }
          >
            {name}
          </p>
        </a>
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();

  React.useEffect(() => {
    // dispatch(setSecondPaneOpenPath());
    return () => {};
  }, []);

  const secondPaneOpenPathname = useSelector(
    (state) => state.app.secondPaneOpenPathname
  );

  const { childLinks } = sidebarRoutes.find(
    (sidebarRoute) => sidebarRoute.slug === secondPaneOpenPathname
  );

  return (
    <>
      <nav className="side-bar left-0 fixed top-0 bottom-0 overflow-y-auto flex-row overflow-hidden flex flex-wrap items-center justify-between w-80 z-10">
        <div className={"min-h-full px-0 mx-auto flex w-full shadow-none"}>
          <div className="w-1/3 bg-blueGray-100 min-h-full">
            <ul className="flex-col min-w-full list-none">
              {sidebarRoutes.map((sidebarRoute) => {
                return (
                  <NavLink key={sidebarRoute.id} sidebarRoute={sidebarRoute} />
                );
              })}
            </ul>
          </div>
          <div className="w-2/3">
            <p className="text-left text-blueGray-600 block uppercase font-bold p-4">
              Electro Darko House HQ, East Legon
            </p>
            <hr className="my-4 min-w-full" />

            <ul className="flex-col min-w-full list-none">
              {childLinks.map((childLink) => {
                return (
                  <ChildNavLink key={childLink.id} childLink={childLink} />
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

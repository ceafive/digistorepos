import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { sidebarRoutes } from "utils/routes";
import { useDispatch, useSelector } from "react-redux";
import { setSecondPaneOpenPath, setSidebarSecondPaneOpen } from "features/app/appSlice";
import { onSelectCategory, setOutletSelected } from "features/products/productsSlice";
import { onResetCart } from "features/cart/cartSlice";

const NavLink = ({ sidebarRoute }) => {
  const { name, slug, path, icon, iconColor } = sidebarRoute;
  const router = useRouter();
  const dispatch = useDispatch();

  const secondPaneOpenPathname = useSelector((state) => state.app.secondPaneOpenPathname);

  return (
    <li className={`text-center  ${secondPaneOpenPathname === slug ? "bg-white" : ""}`}>
      <button
        className=" w-full h-full focus:outline-none"
        onClick={() => {
          dispatch(
            setSecondPaneOpenPath({
              name: slug,
            })
          );
          dispatch(setSidebarSecondPaneOpen(true));
        }}
      >
        <span className={"text-lg py-3 font-bold block " + "text-blueGray-700 hover:text-blueGray-500"}>
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
  const dispatch = useDispatch();

  const handleClick = (e, path) => {
    e.preventDefault();
    dispatch(setSidebarSecondPaneOpen(false));

    router.push(path);
  };

  return (
    <li className={`text-left p-3 py-5`}>
      <button className="focus:outline-none font-semibold" onClick={(e) => handleClick(e, path)}>
        <span
          className={
            router.pathname.indexOf(path) !== -1
              ? "text-lightBlue-500 hover:text-lightBlue-600"
              : "text-blueGray-700 hover:text-blueGray-500"
          }
        >
          {name}
        </span>
      </button>
    </li>
  );
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const outlets = useSelector((state) => state.products.outlets);
  const outletSelected = useSelector((state) => state.products.outletSelected);

  React.useEffect(() => {
    // dispatch(setSecondPaneOpenPath());
    return () => {};
  }, []);

  const secondPaneOpenPathname = useSelector((state) => state.app.secondPaneOpenPathname);
  const openSidebarSecondpane = useSelector((state) => state.app.openSidebarSecondpane);

  const { childLinks } = sidebarRoutes.find((sidebarRoute) => sidebarRoute.slug === secondPaneOpenPathname);

  return (
    <>
      <nav
        className={`side-bar left-0 fixed top-0 bottom-0 overflow-y-auto flex-row overflow-hidden ${
          openSidebarSecondpane ? "w-64" : "w-28"
        } z-10`}
      >
        <div className={"min-h-full px-0 mx-auto flex w-full shadow-none"}>
          <div className={`first-pane ${openSidebarSecondpane ? "w-28" : "w-28"} bg-blueGray-100`}>
            <ul className="flex-col min-w-full list-none">
              {sidebarRoutes.map((sidebarRoute) => {
                return <NavLink key={sidebarRoute.id} sidebarRoute={sidebarRoute} />;
              })}
            </ul>
          </div>

          <div className={`second-pane ${openSidebarSecondpane ? "flex-grow" : "w-0"}`}>
            <p className="text-left text-blueGray-600 block uppercase font-bold p-4">
              {outlets.find((outlet) => outlet.outlet_id === outletSelected)?.outlet_name}
            </p>
            {outlets.length > 1 && (
              <div>
                <div className="w-full px-3 mb-6 ">
                  <div className="relative">
                    <label htmlFor="" className="text-sm font-bold">
                      Change Outlet
                    </label>
                    <select
                      onChange={(e) => {
                        e.persist();
                        dispatch(setOutletSelected(e.target.value));
                        dispatch(onResetCart());

                        dispatch(
                          onSelectCategory({
                            category_id: "ALL",
                            category_name: "ALL",
                            category_description: "All Categories",
                          })
                        );
                      }}
                      className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                      {outlets.map((outlet) => {
                        return (
                          <option key={outlet.outlet_name} value={outlet.outlet_id}>
                            {outlet.outlet_name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )}
            <hr className="my-4 min-w-full" />

            <ul className="flex-col list-none">
              {childLinks.map((childLink) => {
                return <ChildNavLink key={childLink.id} childLink={childLink} />;
              })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

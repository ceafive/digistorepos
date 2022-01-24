import { setSecondPaneOpenPath, setSidebarSecondPaneOpen } from "features/app/appSlice";
import { useRouter } from "next/router";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sidebarRoutes } from "utils";

const NavLink = ({ sidebarRoute }) => {
  const { name, slug, path, icon, iconColor } = sidebarRoute;
  const router = useRouter();
  const dispatch = useDispatch();

  const secondPaneOpenPathname = useSelector((state) => state.app.secondPaneOpenPathname);

  return (
    <li className={`text-center  ${secondPaneOpenPathname === slug ? "bg-white" : ""}`}>
      <button
        className="w-full h-full  focus:outline-none"
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
    <li className={`text-left p-3 py-2`}>
      <button className="text-xs font-semibold focus:outline-none xl:text-sm" onClick={(e) => handleClick(e, path)}>
        <span
          className={
            router.pathname.indexOf(path) !== -1 ? "text-lightBlue-500 hover:text-lightBlue-600" : "text-blueGray-700 hover:text-blueGray-500"
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

  let user = sessionStorage?.getItem("IPAYPOSUSER");
  user = JSON.parse(user);
  const isBooking = user?.user_permissions?.includes("BUKNSMGT") ? true : false || false;

  const secondPaneOpenPathname = useSelector((state) => state.app.secondPaneOpenPathname);
  const openSidebarSecondpane = useSelector((state) => state.app.openSidebarSecondpane);

  // console.log(router);

  React.useEffect(() => {
    const slug = router?.pathname?.split("/")[1];
    slug &&
      dispatch(
        setSecondPaneOpenPath({
          name: slug,
        })
      );
  }, []);

  // console.log(openSidebarSecondpane);
  // console.log(secondPaneOpenPathname);

  const { childLinks } = sidebarRoutes(isBooking)?.find((sidebarRoute) => sidebarRoute.slug === secondPaneOpenPathname);

  return (
    <>
      <nav
        style={{ top: 70 }}
        className={`side-bar left-0 fixed bottom-0 overflow-y-auto flex-row overflow-hidden ${
          openSidebarSecondpane ? "w-48 xl:w-64" : "w-24 xl:w-32"
        } z-10`}
      >
        <div className={"min-h-full px-0 mx-auto flex w-full shadow-none"}>
          <div className={`first-pane w-24 xl:w-32 bg-blueGray-100`}>
            <ul className="flex-col min-w-full list-none">
              {sidebarRoutes(isBooking).map((sidebarRoute) => {
                return <NavLink key={sidebarRoute.id} sidebarRoute={sidebarRoute} />;
              })}
            </ul>
          </div>

          <div className={`second-pane py-4 ${openSidebarSecondpane ? "flex-grow" : "w-0"}`}>
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

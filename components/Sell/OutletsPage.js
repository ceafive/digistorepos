import axios from "axios";
import Spinner from "components/Spinner";
import { onResetCart } from "features/cart/cartSlice";
import { onSelectCategory, setAllOutlets, setOutletSelected } from "features/products/productsSlice";
import { intersectionWith } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const Outlet = ({ outlet }) => {
  const dispatch = useDispatch();
  return (
    <div
      key={outlet.outlet_id}
      className="rounded cursor-pointer"
      // className="w-40 h-40 shadow-lg rounded cursor-pointer"
      onClick={() => {
        dispatch(setOutletSelected(outlet?.outlet_id));
        dispatch(onResetCart());
        dispatch(
          onSelectCategory({
            category_id: "ALL",
            category_name: "ALL",
            category_description: "All Categories",
          })
        );
      }}
    >
      <div className="w-full h-full rounded-xl shadow-lg overflow-hidden">
        <div className="relative" style={{ paddingBottom: "75%" }}>
          <img className="absolute object-cover w-full h-full" src={outlet.outlet_image} alt={outlet.outlet_name} />
        </div>
        <div className="bg-white text-black p-2 h-full mt-2">
          <p className="font-bold text-lg my-1">{outlet.outlet_name}</p>
          <p className="my-1">
            <span>Address: </span>
            <span className="font-bold">{outlet.outlet_address}</span>
          </p>
          <p className="my-1">
            <span>Contact: </span>
            <span className="font-bold">{outlet.outlet_contact}</span>
          </p>

          {outlet?.outlet_opening_hours && (
            <div className="my-1">
              <p>Opening Hours: </p>
              {outlet?.outlet_opening_hours?.map((openingHour) => {
                return (
                  <p key={openingHour?.outlet_opening_day}>
                    <span>{openingHour?.outlet_opening_day}:</span>{" "}
                    <span className="font-bold">{openingHour?.outlet_opening_starttime}</span> {"-"}{" "}
                    <span className="font-bold">{openingHour?.outlet_opening_endtime}</span>
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OutletsPage = () => {
  const dispatch = useDispatch();
  const outlets = useSelector((state) => state.products.outlets);
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const res = await axios.post("/api/sell/sell/get-outlets", user);
        const { data } = await res.data;
        const { user_assigned_outlets } = user;

        const response = intersectionWith(data, user_assigned_outlets ?? [], (arrVal, othVal) => {
          return arrVal.outlet_id === othVal;
        });
        dispatch(setAllOutlets(user_assigned_outlets ? response : data));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching) {
    return <Spinner />;
  }

  return (
    <div>
      {" "}
      <div className="justify-center mt-4 min-h-screen">
        <div className="text-center font-semibold text-lg my-4">
          <p>Select Outlet</p>
        </div>

        <div className="grid grid-cols-4 gap-4 ">
          {outlets.map((outlet, index) => {
            return <Outlet key={index} outlet={outlet} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default OutletsPage;

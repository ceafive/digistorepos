import React from "react";
import Admin from "layouts/Admin.js";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOutletSelected } from "features/products/productsSlice";

import { useSelector } from "react-redux";

import SellPage from "components/Sell/SellPage";

import { motion } from "framer-motion";
import OutletsPage from "components/Sell/OutletsPage";

export default function Sell() {
  const dispatch = useDispatch();
  const outletSelected = useSelector((state) => state.products.outletSelected);

  const userDetails = sessionStorage.getItem("IPAYPOSUSER") ? JSON.parse(sessionStorage.getItem("IPAYPOSUSER")) : null;

  React.useEffect(() => {
    if (userDetails?.user_assigned_outlets?.length === 1) {
      dispatch(setOutletSelected(userDetails?.user_assigned_outlets[0]));
    }
  }, [dispatch, userDetails?.user_assigned_outlets]);

  if (!userDetails) {
    return null;
  }

  if (userDetails?.user_assigned_outlets?.length === 1) {
    return <SellPage />;
  }

  if (userDetails?.user_assigned_outlets?.length > 1) {
    return <OutletsPage />;
  }

  return null;
}

Sell.layout = Admin;

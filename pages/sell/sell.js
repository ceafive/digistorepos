import React from "react";
import Admin from "layouts/Admin.js";
import axios from "axios";
import { useDispatch } from "react-redux";
import { productsAdded, customersAdded, onSetProductCategories, openInventoryModal } from "features/products/productsSlice";
import SearchResults from "components/SearchResults";
import Cart from "components/Cart/Cart";
import Modal from "components/Modal";
import InventoryDetails from "components/Product/InventoryDetails";
import { useSelector } from "react-redux";
import ProcessSale from "components/ProcessSale";

import { motion } from "framer-motion";

export default function Sell() {
  const dispatch = useDispatch();
  const clickToCheckout = useSelector((state) => state.cart.clickToCheckout);
  const inventoryModalOpen = useSelector((state) => state.products.inventoryModalOpen);

  React.useEffect(() => {
    const getProducts = async () => {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const res = await axios.post("/api/products/get-outlet-products", user);
      const { data } = await res.data;
      dispatch(productsAdded(data));
      // console.log(data);

      // const res = await axios.get("https://jsonplaceholder.typicode.com/photos");
      // const data = await res.data;
      // dispatch(productsAdded(data.slice(0, 100)));
    };

    const getProductCategories = async () => {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const res = await axios.post("/api/products/get-outlet-categories", user);
      const { data } = await res.data;
      // console.log(data);
      dispatch(onSetProductCategories(data));
    };

    const fetchCustomers = async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      const data = await res.data;
      dispatch(customersAdded(data.slice(0)));
    };

    fetchCustomers();
    getProducts();
    getProductCategories();
  }, [dispatch]);

  return (
    <>
      <div className="min-h-screen">
        {!clickToCheckout && (
          <motion.div className="flex">
            <Modal open={inventoryModalOpen} onClose={() => dispatch(openInventoryModal())}>
              <InventoryDetails onClose={() => dispatch(openInventoryModal())} />
            </Modal>
            <div className="w-full xl:w-7/12 pb-6 pt-12 px-4">
              <SearchResults />
            </div>
            <div className="w-full xl:w-5/12 pb-6 pt-6 px-4">
              <Cart />
            </div>
          </motion.div>
        )}
        {clickToCheckout && (
          <motion.div initial={{ y: "100vh" }} animate={{ y: 0 }} transition={{ duration: 0.2, type: "tween" }}>
            <ProcessSale />
          </motion.div>
        )}
      </div>
    </>
  );
}

Sell.layout = Admin;

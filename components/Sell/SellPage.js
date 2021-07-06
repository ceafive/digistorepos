import axios from "axios";
import Cart from "components/Cart/Cart";
import Modal from "components/Modal";
import ProcessSale from "components/ProcessSale";
import InventoryDetails from "components/Product/InventoryDetails";
import ProductsSelection from "components/ProductsSelection";
import Spinner from "components/Spinner";
import { setActivePayments, setDeliveryTypes } from "features/cart/cartSlice";
import {
  onSetProductCategories,
  openInventoryModal,
  productsAdded,
  setAllOutlets,
  setOutletSelected,
} from "features/products/productsSlice";
import { motion } from "framer-motion";
import { filter, intersectionWith } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const SellPage = () => {
  const dispatch = useDispatch();
  const clickToCheckout = useSelector((state) => state.cart.clickToCheckout);
  const inventoryModalOpen = useSelector((state) => state.products.inventoryModalOpen);
  const productsOnHold = useSelector((state) => state.products.productsOnHold);

  // Compnent State
  const [fetching, setFetching] = React.useState(null);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allProductsRes = await axios.post("/api/sell/get-all-products", { user });
        const allCategoriesRes = await axios.post("/api/sell/get-all-categories", { user });
        const deliveryTypesRes = await axios.post("/api/sell/get-delivery-type", { user });
        const activePaymentsRes = await axios.post("/api/sell/get-active-payments");
        const outletsRes = await axios.post("/api/sell/get-outlets", { user });

        const { data: allProductsResData } = await allProductsRes.data;
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const { data: deliveryTypesResData } = await deliveryTypesRes.data;
        const { data: activePaymentsResData } = await activePaymentsRes.data;
        const { data: outletsResData } = await outletsRes.data;
        // console.log({ outletsResData, user_assigned_outlets, response });

        dispatch(productsAdded(filter(allProductsResData, (o) => Boolean(o))));
        dispatch(onSetProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
        dispatch(setDeliveryTypes(deliveryTypesResData));
        dispatch(setActivePayments(activePaymentsResData));

        const { user_assigned_outlets } = user;
        const response = intersectionWith(outletsResData, user_assigned_outlets ?? [], (arrVal, othVal) => {
          return arrVal.outlet_id === othVal;
        });
        dispatch(setAllOutlets(user_assigned_outlets ? response : outletsResData));
        if (response.length === 1) {
          dispatch(setOutletSelected(response[0]));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch, productsOnHold]);

  if (fetching || fetching === null) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      {!clickToCheckout && (
        <div className="flex" initial={{ y: "-20vh" }} animate={{ y: 0 }} transition={{ duration: 0.1, type: "tween" }}>
          <Modal open={inventoryModalOpen} onClose={() => dispatch(openInventoryModal())}>
            <InventoryDetails onClose={() => dispatch(openInventoryModal())} />
          </Modal>
          <div className="w-7/12 xl:w-8/12 pb-6 pt-12 px-4">
            <ProductsSelection />
          </div>
          <div className="w-5/12 xl:w-4/12 pb-6 pt-12 px-4">
            <Cart />
          </div>
        </div>
      )}
      {clickToCheckout && (
        <motion.div className="pb-6 pt-12" initial={{ y: "100vh" }} animate={{ y: 0 }} transition={{ duration: 0.2, type: "tween" }}>
          <ProcessSale />
        </motion.div>
      )}
    </>
  );
};

export default SellPage;

import axios from "axios";
import Cart from "containers/sell/sell/cart/Cart";
import ProcessSale from "containers/sell/sell/ProcessSale";
// import Modal from "components/Modal";
// import InventoryDetails from "components/Product/InventoryDetails";
// import ProcessSale from "components/Sell/ProcessSale";
import ProductsSelection from "containers/sell/sell/ProductsSelection";
import Spinner from "components/Spinner";
import { setActivePayments, setDeliveryTypes } from "features/cart/cartSlice";
import { onSetProductCategories, openInventoryModal, productsAdded, setAllOutlets } from "features/products/productsSlice";
import { motion } from "framer-motion";
import { filter, intersectionWith, upperCase } from "lodash";
import dynamic from "next/dynamic";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const InventoryDetails = dynamic(() => import("components/Product/InventoryDetails"));
const Modal = dynamic(() => import("components/Modal"));

const SellPage = () => {
  const dispatch = useDispatch();
  const clickToCheckout = useSelector((state) => state.cart.clickToCheckout);
  const inventoryModalOpen = useSelector((state) => state.products.inventoryModalOpen);
  const products = useSelector((state) => state.products.products);
  const productCategories = useSelector((state) => state.products.productCategories);
  const productsOnHold = useSelector((state) => state.products.productsOnHold);

  // console.log(products?.length);
  // console.log(productCategories?.length);

  // Compnent State
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        if (products?.length === 0 || productCategories?.length === 0) {
          setFetching(true);
        }

        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);
        const { user_assigned_outlets, user_merchant_group } = user;

        const allProductsRes = await axios.post("/api/sell/sell/get-all-products", { user });
        const allCategoriesRes = await axios.post("/api/sell/sell/get-all-categories", { user });
        const { data: allProductsResData } = await allProductsRes.data;
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        dispatch(productsAdded(filter(allProductsResData, (o) => Boolean(o))));
        dispatch(onSetProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
        setFetching(false);

        const deliveryTypesRes = await axios.post("/api/sell/sell/get-delivery-type", { user });
        const activePaymentsRes = await axios.post("/api/sell/sell/get-active-payments");
        const outletsRes = await axios.post("/api/sell/sell/get-outlets", { user });

        const { data: deliveryTypesResData } = await deliveryTypesRes.data;
        const { data: activePaymentsResData } = await activePaymentsRes.data;
        const { data: outletsResData } = await outletsRes.data;
        // console.log({ allCategoriesResData, allProductsResData });

        dispatch(setDeliveryTypes(deliveryTypesResData));
        dispatch(setActivePayments(activePaymentsResData));

        const upperCaseMerchantGroup = upperCase(user_merchant_group);

        if (upperCaseMerchantGroup === "ADMINISTRATORS") {
          dispatch(setAllOutlets(outletsResData));
        } else {
          const response = intersectionWith(
            filter(outletsResData, (o) => Boolean(o)),
            user_assigned_outlets ?? [],
            (arrVal, othVal) => {
              return arrVal.outlet_id === othVal;
            }
          );

          dispatch(setAllOutlets(response));
        }
        setFetching(false);
      } catch (error) {
        setFetching(true);
        let errorResponse = "";
        if (error.response) {
          errorResponse = error.response.data;
        } else if (error.request) {
          errorResponse = error.request;
        } else {
          errorResponse = { error: error.message };
        }
        console.log(errorResponse);
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching || fetching === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen-75">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-6">
      {!clickToCheckout && (
        <div className="flex" initial={{ y: "-20vh" }} animate={{ y: 0 }} transition={{ duration: 0.1, type: "tween" }}>
          <Modal open={inventoryModalOpen} onClose={() => dispatch(openInventoryModal())}>
            <InventoryDetails onClose={() => dispatch(openInventoryModal())} />
          </Modal>
          <div className="w-7/12 px-4 xl:w-8/12">
            <ProductsSelection />
          </div>
          <div className="w-5/12 px-4 xl:w-4/12">
            <Cart />
          </div>
        </div>
      )}
      {clickToCheckout && (
        <motion.div className="" initial={{ y: "100vh" }} animate={{ y: 0 }} transition={{ duration: 0.2, type: "tween" }}>
          <ProcessSale />
        </motion.div>
      )}
    </div>
  );
};

export default SellPage;

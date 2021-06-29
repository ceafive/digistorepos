import React from "react";
import SearchResults from "components/SearchResults";
import Cart from "components/Cart/Cart";
import Modal from "components/Modal";
import InventoryDetails from "components/Product/InventoryDetails";
import Spinner from "components/Spinner";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import ProcessSale from "components/ProcessSale";
import { motion } from "framer-motion";
import {
  productsAdded,
  customersAdded,
  onSetProductCategories,
  openInventoryModal,
  setCategoryProductsCount,
} from "features/products/productsSlice";
import axios from "axios";
import { setDeliveryTypes } from "features/cart/cartSlice";
import { filter } from "lodash";

const SellPage = () => {
  const dispatch = useDispatch();
  const clickToCheckout = useSelector((state) => state.cart.clickToCheckout);
  const inventoryModalOpen = useSelector((state) => state.products.inventoryModalOpen);

  // Compnent State
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allProductsRes = await axios.post("/api/products/get-all-products", { user });
        const allCategoriesRes = await axios.post("/api/products/get-all-categories", { user });

        const { data: allProductsResData } = await allProductsRes.data;
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        // console.log({ allProductsResData, allCategoriesResData, deliveryTypesResData });

        dispatch(productsAdded(filter(allProductsResData, (o) => Boolean(o))));
        dispatch(onSetProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));

        setFetching(false);
      } catch (error) {
        console.log(error);
      } finally {
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching) {
    return (
      <div className="min-h-screen-75 flex flex-col justify-center items-center h-full w-full">
        <Spinner type="TailSpin" width={100} height={100} timeout={30000} />
      </div>
    );
  }

  return (
    <>
      {!clickToCheckout && (
        <motion.div className="flex" initial={{ y: "-20vh" }} animate={{ y: 0 }} transition={{ duration: 0.1, type: "tween" }}>
          <Modal open={inventoryModalOpen} onClose={() => dispatch(openInventoryModal())}>
            <InventoryDetails onClose={() => dispatch(openInventoryModal())} />
          </Modal>
          <div className="w-6/12 xl:w-8/12  pb-6 pt-12 px-4">
            <SearchResults />
          </div>
          <div className="w-6/12 xl:w-4/12  pb-6 pt-12 px-4">
            <Cart />
          </div>
        </motion.div>
      )}
      {clickToCheckout && (
        <motion.div className="pb-6 pt-12" initial={{ y: "100vh" }} animate={{ y: 0 }} transition={{ duration: 0.1, type: "tween" }}>
          <ProcessSale />
        </motion.div>
      )}
    </>
  );
};

export default SellPage;

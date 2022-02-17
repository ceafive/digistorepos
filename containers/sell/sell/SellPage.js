import axios from "axios";
import Spinner from "components/Spinner";
import Cart from "containers/sell/sell/cart/Cart";
import ProcessSale from "containers/sell/sell/ProcessSale";
// import Modal from "components/Modal";
// import InventoryDetails from "components/Product/InventoryDetails";
// import ProcessSale from "components/Sell/ProcessSale";
import ProductsSelection from "containers/sell/sell/ProductsSelection";
import {
  addCustomer,
  onClickToCheckout,
  setActivePayments,
  setAutoDiscount,
  setBookingClientInformation,
  setCartPromoCode,
  setDeliveryCharge,
  setDeliveryLocationInputted,
  setDeliveryNotes,
  setDeliveryTypes,
  setDeliveryTypeSelected,
  setOutletSelected,
  setPaymentMethodSet,
  setPromoAmount,
  setPromoType,
} from "features/cart/cartSlice";
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
  const outlets = useSelector((state) => state.products.outlets);
  const outletSelected = useSelector((state) => state.cart.outletSelected);

  // console.log(productCategories?.length);

  // Compnent State
  const [fetching, setFetching] = React.useState(false);
  const [reFetch, setReFetch] = React.useState(new Date());

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        if (products?.length === 0 || productCategories?.length === 0) {
          setFetching(true);
        }

        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);
        const { user_assigned_outlets, user_merchant_group, user_merchant_id } = user;

        // const allProductsRes = await axios.post("/api/sell/sell/get-all-products", { merchant: user_merchant_id });
        const allCategoriesRes = await axios.post("/api/sell/sell/get-all-categories", { user });
        // const { data: allProductsResData } = await allProductsRes.data;
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        // dispatch(productsAdded(filter(allProductsResData, (o) => Boolean(o))));
        dispatch(onSetProductCategories(filter(allCategoriesResData, (o) => Boolean(o))));
        setFetching(false);

        const deliveryTypesRes = await axios.post("/api/sell/sell/get-delivery-type", { user });
        const activePaymentsRes = await axios.post("/api/sell/sell/get-active-payments");
        const outletsRes = await axios.post("/api/sell/sell/get-outlets", { user });
        const autoDiscountRes = await axios.post("/api/sell/sell/get-automatic-discount", { user });

        const { data: deliveryTypesResData } = await deliveryTypesRes.data;
        const { data: activePaymentsResData } = await activePaymentsRes.data;
        const { data: outletsResData } = await outletsRes.data;
        const { has_auto_discount } = await autoDiscountRes.data;
        // console.log({ allProductsResData });

        dispatch(setDeliveryTypes(deliveryTypesResData));
        dispatch(setActivePayments(activePaymentsResData));
        dispatch(setAutoDiscount(has_auto_discount));

        const upperCaseMerchantGroup = upperCase(user_merchant_group);

        if (upperCaseMerchantGroup === "ADMINISTRATORS") {
          dispatch(setAllOutlets(outletsResData));

          if (outletsResData?.length === 1) {
            dispatch(setOutletSelected(outletsResData[0]));
          }
        } else {
          const response = intersectionWith(
            filter(outletsResData, (o) => Boolean(o)),
            user_assigned_outlets ?? [],
            (arrVal, othVal) => {
              return arrVal.outlet_id === othVal;
            }
          );

          dispatch(setAllOutlets(response));

          if (response?.length === 1) {
            dispatch(setOutletSelected(response[0]));
          }
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
  }, [reFetch]);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!outletSelected) return false;
        if (products?.length === 0) {
          setFetching(true);
        }

        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const allProductsRes = await axios.post("/api/sell/sell/get-all-products", {
          merchant: user?.user_merchant_id,
          outlet: outletSelected?.outlet_id,
        });
        const { data: allProductsResData } = await allProductsRes.data;
        // console.log({ allProductsResData });

        dispatch(productsAdded(filter(allProductsResData, (o) => Boolean(o))));

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
  }, [outletSelected]);

  if (fetching || fetching === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen-75">
        <Spinner type="TailSpin" width={50} height={50} />
      </div>
    );
  }

  // console.log(outlets);

  return (
    <>
      {outletSelected ? (
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
              <ProcessSale setReFetch={setReFetch} />
            </motion.div>
          )}
        </div>
      ) : (
        <>
          {outlets.length > 1 ? (
            <div className="w-full flex justify-center items-center min-h-screen-75">
              <div className="h-full w-full">
                <>
                  <h1 className="font-semibold text-center mb-2">Select Outlet</h1>
                  <div className="grid grid-cols-3 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
                    {outlets.map((outlet) => {
                      return (
                        <button
                          key={outlet.outlet_name}
                          className={`${
                            outletSelected?.outlet_name === outlet.outlet_name ? "ring-2" : ""
                          } w-36 h-24 border border-gray-300 focus:outline-none rounded shadow overflow-hidden font-bold px-2 break-words`}
                          onClick={() => {
                            dispatch(setOutletSelected(outlet));
                          }}
                        >
                          {outlet.outlet_name}
                        </button>
                      );
                    })}
                  </div>
                </>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full min-h-screen-75">
              <Spinner type="TailSpin" width={50} height={50} />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default SellPage;

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
import { productsAdded, customersAdded, onSetProductCategories, openInventoryModal } from "features/products/productsSlice";
import axios from "axios";

const SellPage = () => {
  const dispatch = useDispatch();
  const clickToCheckout = useSelector((state) => state.cart.clickToCheckout);
  const inventoryModalOpen = useSelector((state) => state.products.inventoryModalOpen);
  const outletSelected = useSelector((state) => state.products.outletSelected);

  const [fetching, setFetching] = React.useState(false)

  // console.log({outletSelected,fetching});
  

  React.useEffect(() => {
    const fetchItems = async ()=>{
      try {
        setFetching(true)
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);
  
        const productsAddedRes = await axios.post("/api/products/get-outlet-products", {user,outletSelected});
        const onSetProductCategoriesRes = await axios.post("/api/products/get-outlet-categories", {user,outletSelected});
        
        const { data:productsAddedResData } = await productsAddedRes.data;
        const { data:onSetProductCategoriesResData } = await onSetProductCategoriesRes.data;

        // console.log({productsAddedResData, onSetProductCategoriesResData});
    
        dispatch(productsAdded(productsAddedResData));
        dispatch(onSetProductCategories(onSetProductCategoriesResData));
        
      } catch (error) {
        console.log(error);
      }finally{
        setFetching(false)
      }
    }



    const fetchCustomers = async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      const data = await res.data;
      dispatch(customersAdded(data.slice(0)));
    };

    fetchCustomers();
    fetchItems()

  }, [dispatch, outletSelected]);


  if(fetching){
    return    <div className="min-h-screen flex-col justify-center items-center w-full">
      <Spinner/>
      </div>
  }

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
};

export default SellPage;
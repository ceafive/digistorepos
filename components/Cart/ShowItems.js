import Accordion from "components/Accordion";
import { motion } from "framer-motion";
import React from "react";
import { useSelector } from "react-redux";

const ShowItems = () => {
  const productsInCart = useSelector((state) => state.cart.productsInCart);
  // console.log(productsInCart);
  return (
    <div className="w-full overflow-x-hidden overflow-scroll" style={{ height: 400 }}>
      {productsInCart.map((product, index) => {
        return (
          <motion.div key={product.uniqueId} initial={{ x: "50vw" }} animate={{ x: 0 }} transition={{ type: "tween", duration: 0.05 }}>
            <Accordion product={product} index={index} key={product.uniqueId} />
            <hr />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShowItems;

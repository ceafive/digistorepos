import { openProductModal } from "features/products/productsSlice";
import { upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const InventoryDetails = ({ onClose }) => {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.productToView);
  // console.log({ product });

  return (
    <div className="relative flex w-full bg-white rounded-lg overflow-hidden">
      <button className="absolute right-0 top-0 p-2 text-2xl focus:outline-none text-red-500" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      <div>
        <img className="w-64 h-64" src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.imgURL}`} alt={product?.title} />
      </div>
      <div className="p-4 pb-0 w-full">
        <div className="text-center">
          <p className="font-bold ">
            <span className="text-xl mr-4">{upperCase(product?.title.slice(0, 30))}</span>
            <span>GHS{product?.price}</span>
          </p>
          <p className="text-sm">Product ID: {product?.id}</p>
        </div>

        <hr className="my-2" />
        <div className="w-full px-10 text-center">
          <div className="flex justify-between ">
            <div>
              <p className="font-semibold">Type</p>
              <p>LED LIGHT</p>
            </div>

            <div>
              <p className="font-semibold">Supplier</p>
              <p>Philips</p>
            </div>

            <div>
              <p className="font-semibold">Brand</p>
              <p>PHILIPS</p>
            </div>

            <div>
              <p className="font-semibold">Supplier Price</p>
              <p>GHC13.00</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mt-6 mb-2">
            <p>Oulet</p>
            <p>Inventory Count</p>
          </div>
          <div className="flex justify-between p-2 bg-gray-200 rounded font-semibold">
            <p>Main Outlet</p>
            <p>2245</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;

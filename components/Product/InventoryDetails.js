import { openProductModal } from "features/products/productsSlice";
import { upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const InventoryDetails = ({ onClose }) => {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.productToView);
  const outletSelected = useSelector((state) => state.products.outletSelected);
  // console.log({ product });
  // console.log({ outletSelected });

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
              <p className="font-semibold">Merchant Name</p>
              <p>{product?.merchant_name}</p>
            </div>

            <div>
              <p className="font-semibold">Category</p>
              <p>{product?.product_category}</p>
            </div>

            <div>
              <p className="font-semibold">Description</p>
              <p>{product?.product_description?.slice(0, 30)}</p>
            </div>

            <div>
              <p className="font-semibold">Unit Cost</p>
              <p>GHS{product?.product_unit_cost}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mt-6 mb-2">
            <p>Oulet</p>
            <p>Inventory Count</p>
          </div>
          <div className="flex justify-between p-2 bg-gray-200 rounded font-semibold">
            <p>{outletSelected ? outletSelected?.outlet_name : "Main Outlet"}</p>
            <p>{product?.product_stock_level}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;

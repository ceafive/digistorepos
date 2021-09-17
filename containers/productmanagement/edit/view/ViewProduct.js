import { useRouter } from "next/router";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const ViewProduct = ({ productToView }) => {
  const router = useRouter();

  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);

  console.log(productToView?.product);
  // console.log({ manageProductCategories });

  return (
    <>
      <button
        className="focus:outline-none font-bold mt-2"
        onClick={() => {
          router.replace("/products/manage");
        }}
      >
        Back
      </button>
      <div className="flex w-full h-full">
        <div className="w-7/12 xl:w-8/12 pb-6 pt-6 px-4">
          <div>
            <h1 className="font-bold text-blue-700 text-center mb-2 text-2xl">Details for {productToView?.productName}</h1>

            <div className="flex flex-wrap w-full  items-center">
              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product ID</label>
                <p>{productToView?.id}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Name</label>
                <p>{productToView?.productName}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Category</label>
                <p>
                  {manageProductCategories.find((category) => category?.product_category_id === productToView?.productCategory)?.product_category}
                </p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Description</label>
                <p>{productToView?.productDescription || "No Description"}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Price</label>
                <p>GHS{productToView?.sellingPrice}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Quantity</label>
                <p>{!productToView?.setInventoryQuantity ? "Unlimited" : productToView?.inventoryQuantity}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Taxed</label>
                <p>{productToView?.applyTax === true ? "YES" : "NO"}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Unit Cost</label>
                <p>{productToView?.costPerItem ? `GHS${productToView?.costPerItem}` : "Not Entered"}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Weight</label>
                <p>{productToView?.weight || "Not Entered"}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Create Date</label>
                <p>{productToView?.product?.product_create_date}</p>
              </div>

              <div className="w-1/3 mb-8">
                <label className="text-sm leading-none  font-bold">Product Merchant Name</label>
                <p>{productToView?.product?.merchant_name}</p>
              </div>

              {productToView?.product?.product_properties && (
                <div className="w-full mb-8">
                  <label className="text-sm leading-none font-bold">Product Properties</label>
                  <div className="flex">
                    {Object.entries(productToView?.product?.product_properties ?? {})?.map((product_property) => {
                      return (
                        <div key={product_property[0]} className="mr-8">
                          <p className="font-bold">{product_property[0]}</p>
                          {product_property[1].map((property) => {
                            return (
                              <p key={property?.property_value}>
                                <span>{property?.property_value}</span>
                                {" - "}
                                <span>GHS{property?.property_price}</span>
                              </p>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {productToView?.product?.product_properties_variants && (
                <div className="w-1/3 mb-8">
                  <label className="text-sm leading-none font-bold">Product Variants</label>
                  <div className="flex ">
                    {productToView?.product?.product_properties_variants?.map((product_property) => {
                      return (
                        <div key={product_property?.variantOptionId} className="mr-8">
                          <p className="text-sm">
                            <p className="font-bold uppercase">{Object.values(product_property?.variantOptionValue).join("/")}</p>
                            <p>Price: GHS{product_property?.variantOptionPrice}</p>
                            <p>Quantity: {product_property?.variantOptionQuantity}</p>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-5/12 xl:w-4/12 pb-6 pt-6 px-4">
          <img className="w-full h-84 object-cover rounded shadow-sm" src={productToView?.productImage} alt={productToView?.productName} />
        </div>
      </div>
    </>
  );
};

export default ViewProduct;

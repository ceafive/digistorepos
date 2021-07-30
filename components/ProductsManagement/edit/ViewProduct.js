import { useRouter } from "next/router";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const ViewProduct = ({}) => {
  const router = useRouter();

  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);

  // console.log({ productWithVariants });

  return (
    <>
      <button
        className="focus:outline-none font-bold mt-2"
        onClick={() => {
          router.back();
        }}>
        Back
      </button>
      <div className="flex w-full h-full">
        <div className="w-7/12 xl:w-8/12 pb-6 pt-12 px-4">
          <div>
            <h1 className="font-bold text-blue-700 text-center mb-2 text-2xl">Details for {productWithVariants?.productName}</h1>

            <div className="flex flex-wrap w-full justify-between items-center">
              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product ID</label>
                <p>{productWithVariants?.id}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Name</label>
                <p>{productWithVariants?.productName}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Category</label>
                <p>
                  {
                    manageProductCategories.find((category) => category?.product_category === productWithVariants?.productCategory)
                      ?.product_category_name
                  }
                </p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Description</label>
                <p>{productWithVariants?.productDescription || "No Description"}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Price</label>
                <p>GHS{productWithVariants?.sellingPrice}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Price</label>
                <p>GHS{productWithVariants?.product_price}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Quantity</label>
                <p>{productWithVariants?.inventoryQuantity === "-99" ? "Unlimited" : productWithVariants?.inventoryQuantity}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Taxed</label>
                <p>{productWithVariants?.applyTax === true ? "YES" : "NO"}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Unit Cost</label>
                <p>{productWithVariants?.costPerItem ? `GHS${productWithVariants?.costPerItem}` : "Not Entered"}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Weight</label>
                <p>{productWithVariants?.weight || "Not Entered"}</p>
              </div>

              {/* <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Create Date</label>
                <p>{productWithVariants?.product_create_date}</p>
              </div> */}

              {/* <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Merchant Name</label>
                <p>{productWithVariants?.merchant_name}</p>
              </div> */}

              {productWithVariants?.product_properties && (
                <div className="mb-8 mr-8">
                  <label className="text-sm leading-none font-bold">Product Properties</label>
                  <div className="flex">
                    {Object.entries(productWithVariants?.product_properties ?? {})?.map((product_property) => {
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

              {productWithVariants?.product_properties_variants && (
                <div className="mb-8 mr-8">
                  <label className="text-sm leading-none font-bold">Product Variants</label>
                  <div className="flex ">
                    {productWithVariants?.product_properties_variants?.map((product_property) => {
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

        <div className="w-5/12 xl:w-4/12 pb-6 pt-12 px-4">
          <img
            className="w-full h-full object-cover rounded shadow-sm"
            src={productWithVariants?.productImage}
            alt={productWithVariants?.productName}
          />
        </div>
      </div>
    </>
  );
};

export default ViewProduct;

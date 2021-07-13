import React from "react";

const ViewProduct = ({ product }) => {
  // console.log({ manageProductOutlets });

  // console.log(productCategory);
  // console.log(showAddCategoryModal);
  // console.log(manageProductCategories);

  return (
    <>
      <div className="flex w-full h-full">
        <div className="w-7/12 xl:w-8/12 pb-6 pt-12 px-4">
          <div>
            <h1 className="font-bold text-blue-700 text-center mb-2 text-2xl">Details for {product?.product_name}</h1>

            <div className="flex flex-wrap w-full justify-between items-center">
              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product ID</label>
                <p>{product?.product_id}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Name</label>
                <p>{product?.product_name}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Category</label>
                <p>{product?.product_category}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Description</label>
                <p>{product?.product_description || "No Description"}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Price</label>
                <p>GHS{product?.product_price}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Price</label>
                <p>GHS{product?.product_price}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Quantity</label>
                <p>{product?.product_quantity === "-99" ? "Unlimited" : product?.product_quantity}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Taxed</label>
                <p>{product?.product_taxed}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Unit Cost</label>
                <p>{product?.product_unit_cost ? `GHS${product?.product_unit_cost}` : "Not Entered"}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Weight</label>
                <p>{product?.product_weight || "Not Entered"}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Create Date</label>
                <p>{product?.product_create_date}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none  font-bold">Product Merchant Name</label>
                <p>{product?.merchant_name}</p>
              </div>

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none font-bold">Product Properties</label>
                <div className="flex">
                  {Object.entries(product?.product_properties)?.map((product_property) => {
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

              <div className="mb-8 mr-8">
                <label className="text-sm leading-none font-bold">Product Variants</label>
                <div className="flex ">
                  {product?.product_properties_variants?.map((product_property) => {
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
            </div>
          </div>
        </div>

        <div className="w-5/12 xl:w-4/12 pb-6 pt-12 px-4">
          <img
            className="w-full h-full object-cover rounded shadow-sm"
            src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}`}
            alt={product.product_name}
          />
        </div>
      </div>
    </>
  );
};

export default ViewProduct;

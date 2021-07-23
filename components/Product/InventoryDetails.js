import { capitalize, find, isEqual, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const InventoryDetails = ({ onClose }) => {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.productToView);
  const outletSelected = useSelector((state) => state.products.outletSelected);
  const [variantQuantity, setVariantQuantity] = React.useState(0);
  // console.log({ product });
  // console.log({ outletSelected });

  React.useEffect(() => {
    if (product?.product_properties_variants && product?.product_properties_variants?.length > 0) {
      const foundVariant = find(product?.product_properties_variants, (o) => {
        return isEqual(product?.variants, o?.variantOptionValue);
      });

      if (foundVariant) setVariantQuantity(foundVariant?.variantOptionQuantity);
    }
  }, []);

  return (
    <div className="relative flex w-full h-full bg-white rounded-lg overflow-hidden mb-4">
      <button className="absolute right-0 top-0 p-2 text-2xl focus:outline-none text-red-500" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      <div className="flex items-center w-5/12">
        <img
          className="w-64 h-64"
          src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}`}
          alt={product?.product_image}
        />
      </div>
      <div className="p-4 pb-0 w-full">
        <div className="text-center">
          <p className="font-bold ">
            <span className="text-xl mr-4">{upperCase(product?.product_name)}</span>
            <span>GHS{product?.price}</span>
          </p>
          <p className="text-sm">Product ID: {product?.product_id}</p>
        </div>

        <hr className="my-2" />
        <div className="w-full px-10 text-center">
          <div className="flex flex-wrap justify-between">
            <div>
              <p className="font-bold">Merchant Name</p>
              <p>{product?.merchant_name}</p>
            </div>

            <div>
              <p className="font-bold">Category</p>
              <p>{product?.product_category}</p>
            </div>

            {/* <div>
              <p className="font-bold">Unit Cost</p>
              <p>GHS{product?.product_unit_cost}</p>
            </div> */}

            {product?.product_description && (
              <div className="w-full">
                <p className="font-bold">Description</p>
                <p>{product?.product_description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-4">
          {product?.product_properties && (
            <div className="mb-4">
              <label className="text-sm leading-none font-bold">Options</label>
              <div className="flex flex-wrap">
                {Object.entries(product?.product_properties ?? {})?.map((product_property) => {
                  return (
                    <div key={product_property[0]} className="mr-8 mb-4">
                      <p className="font-bold">{product_property[0]}</p>
                      {product_property[1].map((property) => {
                        return (
                          <div key={property?.property_value} className="flex">
                            <span>{property?.property_value}</span>
                            {Number(property?.property_price) ? (
                              <p className="flex">
                                {"  -  "}
                                <span>GHS{property?.property_price}</span>
                              </p>
                            ) : (
                              <></>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {product?.product_properties_variants && (
            <div className="mb-4">
              <label className="text-sm leading-none font-bold">Variants</label>
              <div className="flex flex-wrap">
                {product?.product_properties_variants?.map((product_property) => {
                  return (
                    <div key={product_property?.variantOptionId} className="mr-8 mb-4">
                      <div className="text-sm">
                        <p className="font-bold uppercase">{Object.values(product_property?.variantOptionValue).join("/")}</p>
                        <p>Price: GHS{product_property?.variantOptionPrice}</p>
                        <p>Quantity: {product_property?.variantOptionQuantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <p>Selected Variant</p>
            <p>Inventory Count</p>
          </div>
          <div className="flex justify-between p-2 bg-gray-200 rounded font-semibold">
            <div>
              {product.variants && (
                <div className="flex">
                  {Object.entries(product?.variants).map((variant, index) => {
                    return (
                      <p key={variant[0]} className="text-xs font-semibold m-0 p-0">
                        <span>{capitalize(variant[1])}</span>
                        {index !== Object.entries(product?.variants).length - 1 && <span>/ </span>}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
            <p>{variantQuantity ? variantQuantity : product?.product_quantity === "-99" ? "Unlimited" : product?.product_quantity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;

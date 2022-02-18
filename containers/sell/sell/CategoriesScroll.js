import { onSelectCategory } from "features/products/productsSlice";
import { upperCase } from "lodash";
import React from "react";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import { useDispatch, useSelector } from "react-redux";
import { categoryColors, categoryTabColors, repeatFor } from "utils";

function CategoriesScroll({ setOffset }) {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.products);
  const productCategories = useSelector((state) => state.products.productCategories);
  const categorySelected = useSelector((state) => state.products.categorySelected);

  // console.log(repeatFor(productCategories.length + 1));

  const backgroundColors = React.useMemo(() => repeatFor(productCategories?.length + 1), [productCategories]);
  // const backgroundColors = React.useMemo(() => categoryTabColors(productCategories), [productCategories]);
  const allProductCategories = [
    {
      product_category_id: "ALL",
      product_category: "ALL",
      product_category_description: "All Categories",
      product_count: `${products?.length}`,
    },
    ...productCategories,
  ];

  return (
    <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow} className="overflow-hidden">
      <div className="flex justify-center items-center w-full my-4">
        {allProductCategories
          ?.filter((productCatergory) => Boolean(productCatergory))
          ?.map((productCatergory, index) => {
            // console.log(productCatergory);

            return (
              <Card
                products={products}
                key={productCatergory?.product_category_id}
                productCatergory={productCatergory}
                setOffset={setOffset}
                categorySelected={categorySelected}
                backgroundColor={backgroundColors[index]}
                index={index}
              />
            );
          })}
      </div>
    </ScrollMenu>
  );
}

const LeftArrow = () => <></>;
const RightArrow = () => <></>;

function Card({ products, productCatergory, setOffset, categorySelected, backgroundColor }) {
  // console.log(products);
  // console.log(productCatergory);
  const dispatch = useDispatch();

  return (
    <button
      className={`w-32 h-28 shadow rounded-3xl text-white font-semibold
      focus:outline-none transition-colors duration-150 ease-in-out mx-2 break-words
      ${categorySelected?.product_category_id === productCatergory?.product_category_id ? "ring-4 ring-gray-400" : ""}
      `}
      style={{ backgroundColor }}
      onClick={() => {
        setOffset(0);
        dispatch(onSelectCategory(productCatergory));
      }}
    >
      <p>{upperCase(productCatergory?.product_category)}</p>
      <p className="text-xs">
        {productCatergory?.product_category_id !== "ALL"
          ? products?.filter((p) => p?.product_category_id === productCatergory?.product_category_id)?.length
          : productCatergory?.product_count}{" "}
        {/* hack to show number of products for ALL category */}
        {"Products"}
      </p>
      {/* <p className="text-xs">{productCatergory?.product_count}</p> */}
    </button>
  );
}

export default CategoriesScroll;

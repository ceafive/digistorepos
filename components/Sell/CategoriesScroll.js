import { onSelectCategory } from "features/products/productsSlice";
import React from "react";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import { useDispatch, useSelector } from "react-redux";

function CategoriesScroll({ setOffset, categoryTabColors }) {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.products);
  const productCategories = useSelector((state) => state.products.productCategories);
  const categorySelected = useSelector((state) => state.products.categorySelected);

  return (
    <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow} className="overflow-hidden">
      <div className="flex justify-center items-center w-full mt-4">
        <button
          className={`shadow rounded text-black font-semibold border-t-8 ${
            categorySelected?.product_category === "ALL" ? "border-green-500" : "border-gray-300"
          } focus:outline-none transition-colors duration-150 ease-in-out w-32 h-32 mx-2`}
          style={{ backgroundColor: categoryTabColors[0] }}
          onClick={() => {
            setOffset(0);
            dispatch(
              onSelectCategory({
                product_category_id: "ALL",
                product_category: "ALL",
                product_category_description: "All Categories",
              })
            );
          }}
        >
          <p>All</p>
          <p className="text-xs">{products?.length ? `${products.length + " Products"}` : undefined}</p>
        </button>
        {productCategories
          ?.filter((productCatergory) => Boolean(productCatergory))
          ?.map((productCatergory, index) => {
            // console.log(productCatergory);
            return (
              <Card
                key={productCatergory?.product_category_id}
                productCatergory={productCatergory}
                setOffset={setOffset}
                categorySelected={categorySelected}
                categoryTabColors={categoryTabColors}
                dispatch={dispatch}
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

function Card({ productCatergory, setOffset, categorySelected, categoryTabColors, dispatch, index }) {
  return (
    <button
      className={`shadow rounded text-black font-semibold border-t-8 ${
        categorySelected?.product_category === productCatergory?.product_category ? "border-green-500" : "border-gray-300"
      } focus:outline-none transition-colors duration-150 ease-in-out w-32 h-32 mx-2`}
      style={{ backgroundColor: categoryTabColors.slice(1)[index] }}
      onClick={() => {
        setOffset(0);
        dispatch(onSelectCategory(productCatergory));
      }}
    >
      <p>{productCatergory?.product_category}</p>
      <p className="text-xs">{productCatergory?.product_count}</p>
    </button>
  );
}

export default CategoriesScroll;

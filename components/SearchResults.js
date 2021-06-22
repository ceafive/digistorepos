import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFilter } from "react-search-input";
import {
  currentSearchTerm,
  onSelectCategory,
  openInventoryModal,
  openProductModal,
  setProductToView,
} from "features/products/productsSlice";
import { increaseTotalItemsInCart, addItemToCart } from "features/cart/cartSlice";
import Modal from "components/Modal";

import ReactPaginate from "react-paginate";
import { take } from "lodash";
import axios from "axios";
import InventoryDetails from "./Product/InventoryDetails";
import ProductDetails from "./Product/ProductDetails";

const SearchResults = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products);
  const productCategories = useSelector((state) => state.products.productCategories);
  const searchTerm = useSelector((state) => state.products.searchTerm);
  const categorySelected = useSelector((state) => state.products.categorySelected);
  const productModalOpen = useSelector((state) => state.products.productModalOpen);
  const outletSelected = useSelector((state) => state.products.outletSelected);

  const perPage = 12;

  const [searchProductsDisplay, setSearchProductsDisplay] = React.useState(products);
  const [productsDisplay, setProductsDisplay] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [offset, setOffset] = React.useState(Math.ceil(0 * perPage));

  // console.log(productsDisplay);

  React.useEffect(() => {
    const pageCount = Math.ceil(products.length / perPage);
    setPageCount(pageCount);
  }, [products.length]);

  React.useEffect(() => {
    const KEYS_TO_FILTERS = ["title", "url"];
    const filteredProducts = products.filter(createFilter(searchTerm ?? "", KEYS_TO_FILTERS));

    setSearchProductsDisplay(filteredProducts);
  }, [products, searchTerm]);

  React.useEffect(() => {
    if (categorySelected.category_id !== "ALL") {
      const getCategoryProducts = async () => {
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const res = await axios.post("/api/products/get-category-products", {
          user,
          category: categorySelected.category_id,
          outletSelected
        });
        const { data } = await res.data;
        setProductsDisplay(take([...data].slice(offset), perPage));
        // console.log("getCategoryProducts", data);
      };

      getCategoryProducts();
    } else setProductsDisplay(take([...products].slice(offset), perPage));
  }, [offset, pageCount, products, categorySelected, outletSelected]);

  const handlePageClick = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * perPage);
    setOffset(offset);
  };

  return (
    <>
      <Modal open={productModalOpen} onClose={() => dispatch(openProductModal())}>
        <ProductDetails onClose={() => dispatch(openProductModal())} />
      </Modal>
      <div className="relative w-full h-full">
        <div className="mx-auto w-full">
          {/* Search bar and results */}
          <div className="">
            <div className="relative w-full">
              {/* search bar */}
              <div className="relative w-full">
                <span className="z-10 absolute text-center text-blueGray-300 w-8 pl-3 py-3">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    e.persist();
                    dispatch(currentSearchTerm(e.target.value));
                  }}
                  type="text"
                  placeholder="Search here..."
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
                />
                {searchTerm && (
                  <span
                    className="z-10 absolute right-0 text-center text-red-500 w-8 pr-3 py-3 cursor-pointer"
                    onClick={() => {
                      dispatch(currentSearchTerm(""));
                    }}
                  >
                    <i className="fas fa-times-circle"></i>
                  </span>
                )}
              </div>
              <div className="flex items-center w-full mt-4">
                <button
                  className={`shadow rounded bg-white text-black font-semibold border-t-2 ${
                    categorySelected?.category_name === "ALL" ? "border-green-300" : "border-gray-400"
                  } px-6 py-2 focus:outline-none mr-2 transition-colors duration-150 ease-in-out`}
                  onClick={() => {
                    setOffset(0);
                    dispatch(
                      onSelectCategory({
                        category_id: "ALL",
                        category_name: "ALL",
                        category_description: "All Categories",
                      })
                    );
                  }}
                >
                  All
                </button>
                {productCategories?.map((productCatergory) => {
                  return (
                    <button
                      key={productCatergory.category_id}
                      className={`shadow rounded bg-white text-black font-semibold border-t-2 ${
                        categorySelected?.category_name === productCatergory.category_name ? "border-green-300" : "border-gray-400"
                      } px-6 py-2 focus:outline-none mr-2 transition-colors duration-150 ease-in-out`}
                      onClick={() => {
                        setOffset(0);
                        // console.log(productCatergory);
                        dispatch(onSelectCategory(productCatergory));
                      }}
                    >
                      {productCatergory.category_name}
                    </button>
                  );
                })}
              </div>

              {/* search results */}
              {searchTerm && (
                <div
                  className={`z-10 absolute w-full p-4 bg-white rounded shadow-lg ${
                    searchProductsDisplay.length > 0 && "overflow-x-hidden overflow-scroll"
                  }`}
                  style={{
                    top: 60,
                    height: searchProductsDisplay.length > 0 ? 400 : "auto",
                  }}
                >
                  {searchProductsDisplay.length > 0 ? (
                    searchProductsDisplay.map((product) => {
                      return (
                        <div
                          className="w-full py-2 cursor-pointer"
                          key={product.product_id}
                          onClick={() => {
                            dispatch(increaseTotalItemsInCart());
                            dispatch(
                              addItemToCart({
                                id: product.product_id,
                                title: product.product_name,
                                price: Number(parseFloat(product.product_price).toFixed(2)),
                                imgURL: product.product_image,
                              })
                            );
                            // console.log(product);
                          }}
                        >
                          <div className="flex items-center bg-blueGray-800 text-white" key={product.product_id}>
                            <div className="flex items-center w-full">
                              <img className="w-24 h-24" src={product.product_image} alt={product.product_name} />

                              <div className="flex justify-between items-center w-full px-4">
                                <div className="">
                                  <p>{product.product_name}</p>
                                  <p>{product.product_quantity}</p>
                                </div>
                                <div>
                                  <p>GHC{product.product_price}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col justify-between items-center w-full h-full">
                      <p className="font-bold">No Product found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Products Display */}
          <div className="justify-center mt-4">
            <div className="grid grid-cols-3 gap-4 ">
              {productsDisplay.map((product, index) => {
                return (
                  <div
                    key={product.product_id}
                    className="rounded cursor-pointer"
                    // className="w-40 h-40 shadow-lg rounded cursor-pointer"
                    onClick={() => {
                      if (product?.product_properties?.length > 0) {
                        dispatch(setProductToView(product));
                        dispatch(openProductModal());
                      } else {
                        dispatch(increaseTotalItemsInCart());
                        dispatch(
                          addItemToCart({
                            id: product.product_id,
                            title: product.product_name,
                            price: Number(parseFloat(product.product_price).toFixed(2)),
                            imgURL: product.product_image,
                          })
                        );
                      }
                    }}
                  >
                    <div className="w-full h-full rounded-xl shadow-lg overflow-hidden">
                      <div className="relative" style={{ paddingBottom: "75%" }}>
                        <img className="absolute object-cover w-full h-full" src={product.product_image} alt={product.product_name} />
                      </div>
                      <div className="bg-white text-black p-2 h-full">
                        <p className="font-bold">{product.product_name}</p>
                        <p className="text-xs">
                          <span>Quantity: </span>
                          <span className="font-bold">{product.product_quantity}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex w-full justify-center mt-6">
              <ReactPaginate
                previousLabel={"previous"}
                nextLabel={"next"}
                breakLabel={"..."}
                breakClassName={
                  "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                }
                previousLinkClassName={
                  "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                }
                nextLinkClassName={
                  "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                }
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={"relative z-0 inline-flex rounded-md shadow-sm -space-x-px"}
                activeLinkClassName={"z-10 bg-indigo-50 border-indigo-500 text-indigo-600"}
                pageLinkClassName={
                  "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResults;

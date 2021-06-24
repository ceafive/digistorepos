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

const categoryColors = ["#fedede", "#eefefd", "#aeffff", "#deeafa"];

const SearchResults = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products);
  const productCategories = useSelector((state) => state.products.productCategories);
  const searchTerm = useSelector((state) => state.products.searchTerm);
  const categorySelected = useSelector((state) => state.products.categorySelected);
  const productModalOpen = useSelector((state) => state.products.productModalOpen);
  const outletSelected = useSelector((state) => state.products.outletSelected);

  console.log(productCategories);

  const perPage = 12;

  const [searchProductsDisplay, setSearchProductsDisplay] = React.useState(products);
  const [productsDisplay, setProductsDisplay] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [offset, setOffset] = React.useState(Math.ceil(0 * perPage));

  const categoryTabColors = React.useMemo(() => {
    return Array.from({ length: productCategories?.length + 1 }, () => {
      const randomIndex = Math.floor(Math.random() * categoryColors.length);
      return categoryColors[randomIndex];
    });
  }, []);

  React.useEffect(() => {
    const pageCount = Math.ceil(products.length / perPage);
    setPageCount(pageCount);
  }, [products.length]);

  React.useEffect(() => {
    const KEYS_TO_FILTERS = ["product_name", "product_description"];
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
          outletSelected,
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
                  placeholder="Start typing or scanning..."
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
              <div className="flex justify-start items-center w-full mt-4">
                <div className="flex items-center">
                  <button
                    className={`shadow rounded text-black font-semibold border-t-4 ${
                      categorySelected?.category_name === "ALL" ? "border-green-300" : "border-gray-400"
                    } px-6 py-2 focus:outline-none mr-2 transition-colors duration-150 ease-in-out`}
                    style={{ height: 120, width: 120, backgroundColor: categoryTabColors[0] }}
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
                  {productCategories?.map((productCatergory, index) => {
                    return (
                      <button
                        key={productCatergory.category_id}
                        className={`shadow rounded text-black font-semibold border-t-4 ${
                          categorySelected?.category_name === productCatergory.category_name ? "border-green-400" : "border-gray-400"
                        } px-6 py-2 focus:outline-none mr-2 transition-colors duration-150 ease-in-out`}
                        style={{ height: 120, width: 120, backgroundColor: categoryTabColors.slice(1)[index] }}
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
              </div>

              {/* search results */}
              {searchTerm && (
                <div
                  className={`z-10 absolute w-full py-4 px-8 bg-white rounded shadow-lg border  ${
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
                          className="w-full p-2 cursor-pointer border border-gray-400"
                          key={product.product_id}
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
                                  variants: { type: "normal" },
                                })
                              );
                            }
                          }}
                        >
                          <div className="flex items-center text-black font-medium" key={product.product_id}>
                            <div className="flex items-center w-full">
                              <div className="w-48 h-20">
                                <img className="w-full h-full object-cover" src={product.product_image} alt={product.product_name} />
                              </div>

                              <div className="px-4 w-full">
                                <div className="flex justify-between items-center w-full">
                                  <p className="font-semibold">{product.product_name}</p>
                                  <p>GHC{product.product_price}</p>
                                </div>
                                <p>{product.product_id}</p>
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
            <div className="grid grid-cols-4 xl:grid-cols-5 gap-2">
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
                            variants: { type: "normal" },
                          })
                        );
                      }
                    }}
                  >
                    <div className="w-full h-full rounded overflow-hidden" style={{ width: 150 }}>
                      <div className="relative" style={{ paddingBottom: "70%" }}>
                        <img className="absolute object-cover w-full h-full" src={product.product_image} alt={product.product_name} />
                      </div>
                      <div className="bg-white text-black text-center px-2 font-medium">
                        <p className="truncate">{product.product_name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex w-full justify-center mt-6">
              <ReactPaginate
                previousLabel={"prev"}
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

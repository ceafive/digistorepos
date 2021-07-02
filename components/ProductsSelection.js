import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFilter } from "react-search-input";
import {
  currentSearchTerm,
  onSelectCategory,
  openProductModal,
  setAllOutlets,
  setOutletSelected,
  setProductToView,
} from "features/products/productsSlice";
import { increaseTotalItemsInCart, addItemToCart, setActivePayments } from "features/cart/cartSlice";
import Modal from "components/Modal";

import ReactPaginate from "react-paginate";
import { filter, intersectionWith, take } from "lodash";
import axios from "axios";
import Spinner from "./Spinner";

import ProductDetails from "./Product/ProductDetails";
import { useToasts } from "react-toast-notifications";

const categoryColors = [
  "#fedede",
  "#eefefd",
  "#aeffff",
  "#4362ce",
  "#a0b5c3",
  "#aaa385",
  "#0a4585",
  "#49a397",
  "#d8af11",
  "#59b1bf",
  "#dc8394",
  "#b1ccfe",
];

const productColors = [
  "#fedede",
  "#eefefd",
  "#aeffff",
  "#4362ce",
  "#a0b5c3",
  "#aaa385",
  "#0a4585",
  "#49a397",
  "#d8af11",
  "#59b1bf",
  "#dc8394",
  "#b1ccfe",
  "#2df5b0",
];

const ProductsSelection = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const products = useSelector((state) => state.products.products);
  const productCategories = useSelector((state) => state.products.productCategories);
  const searchTerm = useSelector((state) => state.products.searchTerm);
  const categorySelected = useSelector((state) => state.products.categorySelected);
  const productModalOpen = useSelector((state) => state.products.productModalOpen);
  const outlets = useSelector((state) => state.products.outlets);
  const productsInCart = useSelector((state) => state.cart.productsInCart);

  const perPage = 12; // product number to display per page

  // Compnent State
  const [searchProductsDisplay, setSearchProductsDisplay] = React.useState(products);
  const [productsDisplay, setProductsDisplay] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [offset, setOffset] = React.useState(Math.ceil(0 * perPage));
  const [productSelected, setProductSelected] = React.useState(null);
  const [productDisabled, setProductDisabled] = React.useState(null);

  // console.log(categoryProductsCount);
  // console.log(products);
  // console.log(productsDisplay);
  // console.log(categorySelected);

  const categoryTabColors = React.useMemo(() => {
    return Array.from({ length: productCategories?.length + 1 }, () => {
      const randomIndex = Math.floor(Math.random() * categoryColors.length);
      return categoryColors[randomIndex];
    });
  }, [productCategories?.length]);

  const productTabColors = React.useMemo(() => {
    return Array.from({ length: productsDisplay?.length + 1 }, () => {
      const randomIndex = Math.floor(Math.random() * productColors.length);
      return productColors[randomIndex];
    });
  }, [productsDisplay?.length]);

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
    if (categorySelected.product_category !== "ALL") {
      const filtered = filter(products, (o) => o?.product_category === categorySelected.product_category);
      setProductsDisplay(take([...filtered].slice(offset), perPage));
    } else {
      setProductsDisplay(take([...products].slice(offset), perPage));
    }
  }, [categorySelected.product_category, offset, products]);

  const handlePageClick = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * perPage);
    setOffset(offset);
  };

  const checkProductQuantity = (product) => {
    try {
      if (productSelected) {
        // console.log(productsInCart);
        const stock_level = parseInt(product?.product_quantity) - parseInt(product?.product_quantity_sold);
        const productSoldOut = stock_level <= 0;

        if (productSoldOut) {
          return addToast(`Product sold out`, { appearance: "error", autoDismiss: true });
        }

        const foundProduct = productsInCart?.find((productInCart) => productInCart?.product_id === product?.product_id);
        console.log(foundProduct);

        //if not found continue
        if (foundProduct) {
          const isQuantitySelectedUnAvailable = foundProduct?.quantity + 1 > stock_level;
          console.log(isQuantitySelectedUnAvailable);

          if (isQuantitySelectedUnAvailable) {
            return addToast(`Quantity is not availble, available quantity is ${stock_level}`, { appearance: "error", autoDismiss: true });
          }

          dispatch(increaseTotalItemsInCart());
          dispatch(addItemToCart(product));
        } else {
          if (productSoldOut) {
            return addToast(`Product sold out, available quantity is ${stock_level}`, { appearance: "error", autoDismiss: true });
          }

          dispatch(increaseTotalItemsInCart());
          dispatch(addItemToCart(product));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    const status = checkProductQuantity(productSelected);
  }, [productSelected]);

  return (
    <>
      <Modal open={productModalOpen} onClose={() => dispatch(openProductModal())} maxWidth="lg">
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
                            if (product?.product_has_property === "YES") {
                              dispatch(setProductToView(product));
                              dispatch(openProductModal());
                            } else {
                              dispatch(increaseTotalItemsInCart());
                              dispatch(
                                addItemToCart({
                                  ...product,
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
                                <img
                                  className="w-full h-full object-cover"
                                  src={`https://payments.ipaygh.com/app/webroot/img/products/${product?.product_image}`}
                                  alt={product.product_name}
                                />
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
              {/* search results */}

              {/* Categories */}
              <div className="flex justify-start items-center w-full mt-4">
                <div className="grid grid-cols-4 xl:grid-cols-7 gap-3">
                  <button
                    className={`shadow rounded text-black font-semibold border-t-8 ${
                      categorySelected?.product_category === "ALL" ? "border-green-600" : "border-gray-400"
                    } p-2 focus:outline-none transition-colors duration-150 ease-in-out h-32 w-full`}
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
                    All
                  </button>
                  {productCategories
                    ?.filter((productCatergory) => Boolean(productCatergory))
                    ?.map((productCatergory, index) => {
                      // console.log(productCatergory);
                      return (
                        <button
                          key={productCatergory?.product_category_id}
                          className={`shadow rounded text-black font-semibold border-t-8 ${
                            categorySelected?.product_category === productCatergory?.product_category
                              ? "border-green-600"
                              : "border-gray-400"
                          } p-2 focus:outline-none transition-colors duration-150 ease-in-out h-32 w-full`}
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
                    })}
                </div>
              </div>
              {/* Categories */}
            </div>
          </div>

          {/* Products Display */}
          <div className="justify-center mt-4 w-full">
            <h1 className="text-center my-1">Products</h1>
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
              {productsDisplay.map((product, index) => {
                return (
                  <button
                    key={product.product_id}
                    className={`shadow rounded text-black font-semibold px-2 py-2 focus:outline-none transition-colors duration-150 ease-in-out h-32 w-full`}
                    style={{ backgroundColor: productTabColors[index] }}
                    onClick={() => {
                      const data = {
                        ...product,
                        id: product.product_id,
                        title: product.product_name,
                        price: Number(parseFloat(product.product_price).toFixed(2)),
                        imgURL: product.product_image,
                        variants: { type: "normal" },
                      };

                      if (product?.product_has_property === "YES") {
                        dispatch(setProductToView(product));
                        dispatch(openProductModal());
                      } else {
                        setProductSelected(data);
                      }
                    }}
                  >
                    {product.product_name}
                  </button>
                );
              })}
            </div>

            {pageCount > 1 && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsSelection;

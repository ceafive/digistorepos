import Modal from "components/Modal";
import AddProductWithVariants from "components/Product/AddProductWithVariants";
import ProductDetails from "components/Product/ProductDetails";
import { addItemToCart, increaseTotalItemsInCart } from "features/cart/cartSlice";
import { currentSearchTerm, openProductModal, openVariantsModal, setProductToView } from "features/products/productsSlice";
import { filter, take } from "lodash";
import React from "react";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { createFilter } from "react-search-input";
import { useToasts } from "react-toast-notifications";

import CategoriesScroll from "./CategoriesScroll";

const ProductsSelection = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const products = useSelector((state) => state.products.products);
  const searchTerm = useSelector((state) => state.products.searchTerm);
  const categorySelected = useSelector((state) => state.products.categorySelected);
  const productModalOpen = useSelector((state) => state.products.productModalOpen);
  const productWithVariantsOpen = useSelector((state) => state.products.productWithVariantsOpen);
  const productsInCart = useSelector((state) => state.cart.productsInCart);

  var width = window.innerWidth > 0 ? window.innerWidth : screen.width;
  let perPage = 12; // product number to display per page
  perPage = width >= 1536 ? 15 : width < 1280 ? 9 : 12;

  // Compnent State
  const [searchProductsDisplay, setSearchProductsDisplay] = React.useState(products);
  const [productsDisplay, setProductsDisplay] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [offset, setOffset] = React.useState(Math.ceil(0 * perPage));
  const [productSelected, setProductSelected] = React.useState(null);

  const handlePageClick = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * perPage);
    setOffset(offset);
  };

  const checkProductQuantity = (product) => {
    try {
      // console.log(product);
      if (productSelected) {
        // console.log(productsInCart);
        const stock_level = product?.product_quantity === "-99" ? 10000000000000 : parseInt(product?.product_quantity);
        const productSoldOut = stock_level <= 0;

        if (productSoldOut) {
          return addToast(`Product sold out`, { appearance: "error", autoDismiss: true });
        }

        const foundProduct = productsInCart?.find((productInCart) => productInCart?.product_id === product?.product_id);
        // console.log(foundProduct);

        //if not found continue
        if (foundProduct) {
          const isQuantitySelectedUnAvailable = foundProduct?.quantity + 1 > stock_level;
          // console.log(isQuantitySelectedUnAvailable);

          if (isQuantitySelectedUnAvailable) {
            return addToast(`Quantity is not available, available quantity is ${stock_level}`, { appearance: "error", autoDismiss: true });
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
    const KEYS_TO_FILTERS = ["product_name", "product_description"];
    const filteredProducts = products.filter(createFilter(searchTerm ?? "", KEYS_TO_FILTERS));

    setSearchProductsDisplay(filteredProducts);
  }, [products, searchTerm]);

  React.useEffect(() => {
    if (categorySelected.product_category_id === "ALL") {
      const productsLength = products?.length;
      const pageCount = Math.ceil(productsLength / perPage);
      setPageCount(pageCount);
      setProductsDisplay(take([...products].slice(offset), perPage));
    } else {
      const filtered = filter(products, (o) => o?.product_category_id === categorySelected.product_category_id);
      const productsLength = filtered?.length;
      const pageCount = Math.ceil(productsLength / perPage);
      setPageCount(pageCount);
      setProductsDisplay(take([...filtered].slice(offset), perPage));
    }
  }, [categorySelected.product_category, offset, products]);

  React.useEffect(() => {
    checkProductQuantity(productSelected);
  }, [productSelected]);

  return (
    <>
      <Modal open={productModalOpen} onClose={() => dispatch(openProductModal())} maxWidth="md">
        <ProductDetails onClose={() => dispatch(openProductModal())} />
      </Modal>
      <Modal open={productWithVariantsOpen} onClose={() => dispatch(openVariantsModal())} maxWidth="md">
        <AddProductWithVariants onClose={() => dispatch(openVariantsModal())} />
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
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring-1 w-full pl-10"
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
                            const data = {
                              ...product,
                              id: product.product_id,
                              title: product.product_name,
                              price: Number(parseFloat(product.product_price).toFixed(2)),
                              imgURL: product.product_image,
                              variants: { Type: "Normal" },
                            };

                            if (product?.product_has_property === "YES") {
                              dispatch(setProductToView(product));
                              dispatch(openProductModal());
                            } else {
                              setProductSelected(data);
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
                                  <p className="font-semibold">GHS{product.product_price}</p>
                                </div>
                                <p>{product.product_category}</p>
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
              <CategoriesScroll setOffset={setOffset} />
              {/* <div className="flex justify-start items-center w-full mt-4">
                <div className="grid grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
                  <button
                    className={`shadow rounded text-black font-semibold border-t-8 ${
                      categorySelected?.product_category === "ALL" ? "border-green-500" : "border-gray-400"
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
                    <p>All</p>
                    <p className="text-xs">{products?.length ? `${products.length + " Products"}` : undefined}</p>
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
                              ? "border-green-500"
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
              </div> */}
              {/* Categories */}
            </div>
          </div>

          {/* Products Display */}
          <div className="justify-center mt-6 w-full">
            {/* <h1 className="text-center my-1">Products</h1> */}
            <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {productsDisplay.map((product, index) => {
                // console.log(product);
                const imgUrlBase = "https://payments.ipaygh.com/app/webroot/img/products/";
                return (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      const data = {
                        ...product,
                        id: product.product_id,
                        title: product.product_name,
                        price: Number(parseFloat(product.product_price).toFixed(2)),
                        imgURL: product.product_image,
                        variants: { Type: "Normal" },
                      };

                      // console.log(data);

                      if (product?.product_properties_variants?.length) {
                        dispatch(setProductToView(product));
                        dispatch(openVariantsModal());
                        return;
                      } else if (product?.product_properties) {
                        // console.log(product);
                        if (parseInt(product?.product_quantity) === 0) {
                          return addToast(`Product sold out`, { appearance: "error", autoDismiss: true });
                        }
                        dispatch(setProductToView(product));
                        dispatch(openProductModal());
                      } else {
                        setProductSelected(data);
                      }
                    }}
                  >
                    <div key={product.product_id} className="relative" style={{ paddingBottom: "95%" }}>
                      <img
                        className="absolute h-full w-full object-left"
                        // className="absolute h-full w-full object-cover"
                        src={`${imgUrlBase}${product.product_image}`}
                        alt={product.product_name}
                      />
                    </div>
                    <div className="p-2 text-sm">
                      <p className="font-semibold leading-none">{product.product_name}</p>
                      <p className="text-xs pt-1 ">{product.product_category}</p>
                      <p className="font-bold pt-4">GHS{product.product_price}</p>
                      <p className="text-xs pt-1">
                        Quantity:{" "}
                        {product?.product_quantity === "-99"
                          ? "Unlimited"
                          : parseInt(product?.product_quantity) < 0
                          ? 0
                          : parseInt(product?.product_quantity)}
                      </p>
                    </div>
                  </div>
                  // <button
                  //   key={product.product_id}
                  //   className={`shadow rounded text-black font-semibold px-2 py-2 focus:outline-none transition-colors duration-150 ease-in-out h-32 w-full`}
                  //   style={{ backgroundColor: productTabColors[index] }}
                  //   onClick={() => {
                  //     const data = {
                  //       ...product,
                  //       id: product.product_id,
                  //       title: product.product_name,
                  //       price: Number(parseFloat(product.product_price).toFixed(2)),
                  //       imgURL: product.product_image,
                  //       variants: { Type: "Normal" },
                  //     };

                  //     if (product?.product_has_property === "YES") {
                  //       dispatch(setProductToView(product));
                  //       dispatch(openProductModal());
                  //     } else {
                  //       setProductSelected(data);
                  //     }
                  //   }}
                  // >
                  //   {product.product_name}
                  // </button>
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
                    "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-pointer"
                  }
                  previousLinkClassName={
                    "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
                  }
                  nextLinkClassName={
                    "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
                  }
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={"relative z-0 inline-flex rounded-md shadow-sm -space-x-px"}
                  activeLinkClassName={"z-10 bg-indigo-50 border-indigo-500 text-indigo-600"}
                  pageLinkClassName={
                    "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer"
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

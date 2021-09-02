import axios from "axios";
import GooglePlaces from "components/Misc/GooglePlaces";
import {
  setCartPromoCode,
  setDeliveryCharge,
  setDeliveryGPS,
  setDeliveryLocationInputted,
  setDeliveryNotes,
  setPromoAmount,
  setPromoCodeAppliedOnCartPage,
  setPromoType,
} from "features/cart/cartSlice";
import { get, upperCase } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import Spinner from "../../../components/Spinner";

const getStringCoordinates = async (description) => {
  try {
    const response = await axios.post("/api/sell/sell/get-coordinates", { description });
    const responsedata = await response.data;
    const stringCoordinates = `${responsedata["results"][0]["geometry"]["location"]["lat"]},${responsedata["results"][0]["geometry"]["location"]["lng"]}`;
    // const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`; // TODO: used with old url in get coordinates backend route

    return stringCoordinates;
  } catch (error) {
    console.log(error);
  }
};

const Box = ({ option, setProcessingDeliveryCharge }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const outletSelected = useSelector((state) => state.cart.outletSelected);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);
  const promoCodeAppliedOnCartPage = useSelector((state) => state.cart.promoCodeAppliedOnCartPage);
  const cartPromoCode = useSelector((state) => state.cart.cartPromoCode);
  const productsInCart = useSelector((state) => state.cart.productsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);

  React.useEffect(() => {
    if (!promoCodeAppliedOnCartPage && deliveryCharge && outletSelected && cartPromoCode) {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      let orderItems = {};

      productsInCart.forEach((product, index) => {
        orderItems[index] = {
          order_item_no: product?.uniqueId,
          order_item_qty: product?.quantity,
          order_item: product?.title,
          order_item_amt: product?.price,
        };
      });

      const userData = {
        code: upperCase(cartPromoCode),
        amount: deliveryCharge?.price,
        merchant: user["user_merchant_id"],
        order_items: JSON.stringify(orderItems),
        customer: currentCustomer || "",
        outlet: outletSelected?.outlet_id || "",
        type: "DELIVERY",
        route: deliveryCharge?.delivery_code || "",
      };

      // console.log(userData);
      // return;

      (async () => {
        setProcessingDeliveryCharge(true);
        // console.log(promoCodeAppliedOnCartPage);
        // console.log(deliveryCharge);
        const response = await axios.post("/api/sell/sell/add-discount", userData);
        const { status, message, discount } = await response.data;
        console.log({ status, message, discount });
        // addToast(message, { appearance: Number(status) === 0 ? "success" : "error", autoDismiss: true });

        if (Number(status) === 0) {
          dispatch(setPromoAmount(discount));
          dispatch(setPromoType("DELIVERY"));
        } else {
          dispatch(setPromoAmount(0));
          dispatch(setPromoType(""));
          dispatch(setCartPromoCode(null));
        }

        setProcessingDeliveryCharge(false);
      })();
    }
  }, [deliveryCharge, outletSelected]);

  return (
    <div key={option.delivery_location} className="w-full mb-1">
      <button
        key={option.delivery_location}
        className={`${
          deliveryCharge?.delivery_code === option?.delivery_code ? "ring-1" : ""
        } w-full h-10 text-left border border-gray-300 rounded overflow-hidden font-bold px-2 break-words focus:outline-none`}
        onClick={() => {
          const price = get(option, "delivery_price", 0);
          const data = { ...option, price: Number(parseFloat(price)) };
          dispatch(setDeliveryLocationInputted(option.delivery_location));
          dispatch(setDeliveryCharge(data));
        }}
      >
        {option?.delivery_location} {" - "} GHS{option?.delivery_price}
      </button>
    </div>
  );
};

const MerchantDeliveryType = ({ setProcessingDeliveryCharge }) => {
  const dispatch = useDispatch();

  const [fetching, setFetching] = React.useState(false);
  const [listOfValues, setListOfValues] = React.useState([]);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const res = await axios.post("/api/sell/sell/get-delivery-lov", { user });
        const { data } = await res.data;
        // console.log({ data });

        const cleanData = Array.isArray(data) ? data.filter((eachData) => Boolean(eachData)) : [];
        setListOfValues(cleanData);
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center w-full mt-2">
        <Spinner type="TailSpin" width={30} height={30} />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p>Select Delivery Location</p>
      {listOfValues.map((option, index) => {
        return <Box key={index} option={option} setProcessingDeliveryCharge={setProcessingDeliveryCharge} />;
      })}
    </div>
  );
};

const MerchantDistDeliveryType = ({ processingDeliveryCharge, setProcessingDeliveryCharge }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const outletSelected = useSelector((state) => state.cart.outletSelected);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);
  const promoCodeAppliedOnCartPage = useSelector((state) => state.cart.promoCodeAppliedOnCartPage);
  const cartPromoCode = useSelector((state) => state.cart.cartPromoCode);
  const productsInCart = useSelector((state) => state.cart.productsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const deliveryLocationInputted = useSelector((state) => state.cart.deliveryLocationInputted);
  //   console.log(outletSelected);

  React.useEffect(() => {
    if (!promoCodeAppliedOnCartPage && deliveryCharge && outletSelected && cartPromoCode) {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      let orderItems = {};

      productsInCart.forEach((product, index) => {
        orderItems[index] = {
          order_item_no: product?.uniqueId,
          order_item_qty: product?.quantity,
          order_item: product?.title,
          order_item_amt: product?.price,
        };
      });

      const userData = {
        code: upperCase(cartPromoCode),
        amount: deliveryCharge?.price,
        merchant: user["user_merchant_id"],
        order_items: JSON.stringify(orderItems),
        customer: currentCustomer || "",
        outlet: outletSelected?.outlet_id || "",
        type: "DELIVERY",
        route: deliveryCharge?.delivery_code || "",
      };

      // console.log(userData);
      // return;

      (async () => {
        // console.log(promoCodeAppliedOnCartPage);
        // console.log(deliveryCharge);
        const response = await axios.post("/api/sell/sell/add-discount", userData);
        const { status, message, discount } = await response.data;
        console.log({ status, message, discount });
        // addToast(message, { appearance: Number(status) === 0 ? "success" : "error", autoDismiss: true });

        if (Number(status) === 0) {
          dispatch(setPromoAmount(discount));
          dispatch(setPromoType("DELIVERY"));
        } else {
          dispatch(setPromoAmount(0));
          dispatch(setPromoType(""));
          dispatch(setCartPromoCode(null));
        }
      })();
    }
  }, [deliveryCharge, outletSelected]);

  React.useEffect(() => {
    const getCoordinates = async () => {
      setProcessingDeliveryCharge(true);
      const stringCoordinates = await getStringCoordinates(deliveryLocationInputted?.value?.description);

      const fetchItems = async (stringCoordinates) => {
        try {
          setProcessingDeliveryCharge(true);
          let user = sessionStorage.getItem("IPAYPOSUSER");
          user = JSON.parse(user);

          const payload = {
            merchant: user["user_merchant_id"],
            pickup_gps: outletSelected?.outlet_gps,
            destination_gps: stringCoordinates,
          };
          //   console.log({ payload });

          const res = await axios.post("/api/sell/sell/get-merchant-dist-charge", payload);

          if (Number(res?.data?.status) === 91) {
            addToast(res?.data?.message, { appearance: "error", autoDismiss: true });
            dispatch(setDeliveryLocationInputted(null));
            dispatch(setDeliveryCharge(null));
          } else if (Number(res?.data?.status) === 0) {
            let { data } = res.data;
            const price = get(data, "delivery_price", 0);
            data = { ...data, price: Number(parseFloat(price)) };

            dispatch(setDeliveryCharge(data));
          } else {
            addToast(res?.data?.message, { appearance: "error", autoDismiss: true });
            dispatch(setDeliveryLocationInputted(null));
            dispatch(setDeliveryCharge(null));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setProcessingDeliveryCharge(false);
        }
      };

      if (stringCoordinates) {
        dispatch(setDeliveryGPS(stringCoordinates));
        await fetchItems(stringCoordinates);
      }
      setProcessingDeliveryCharge(false);
    };

    if (deliveryLocationInputted?.value?.description) {
      getCoordinates();
    }
  }, [dispatch, outletSelected, deliveryLocationInputted]);

  return (
    <div>
      <p>Select Delivery Location</p>
      <div className="flex items-center w-full">
        <div className={`w-full`}>
          <GooglePlaces
            value={deliveryLocationInputted}
            setValue={(value) => {
              dispatch(setDeliveryLocationInputted(value));
            }}
          />
        </div>
        {processingDeliveryCharge && (
          <div className="ml-2">
            <Spinner type="TailSpin" width={30} height={30} />
          </div>
        )}
      </div>
    </div>
  );
};

const IPAYDeliveryType = ({ processingDeliveryCharge, setProcessingDeliveryCharge }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const outletSelected = useSelector((state) => state.cart.outletSelected);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);
  const promoCodeAppliedOnCartPage = useSelector((state) => state.cart.promoCodeAppliedOnCartPage);
  const cartPromoCode = useSelector((state) => state.cart.cartPromoCode);
  const productsInCart = useSelector((state) => state.cart.productsInCart);
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const deliveryLocationInputted = useSelector((state) => state.cart.deliveryLocationInputted);

  // console.log(deliveryLocationInputted);

  React.useEffect(() => {
    if (!promoCodeAppliedOnCartPage && deliveryCharge && outletSelected && cartPromoCode) {
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      let orderItems = {};

      productsInCart.forEach((product, index) => {
        orderItems[index] = {
          order_item_no: product?.uniqueId,
          order_item_qty: product?.quantity,
          order_item: product?.title,
          order_item_amt: product?.price,
        };
      });

      const userData = {
        code: upperCase(cartPromoCode),
        amount: deliveryCharge?.price,
        merchant: user["user_merchant_id"],
        order_items: JSON.stringify(orderItems),
        customer: currentCustomer || "",
        outlet: outletSelected?.outlet_id || "",
        type: "DELIVERY",
        route: deliveryCharge?.destination || "",
      };

      // console.log(userData);
      // return;

      (async () => {
        setProcessingDeliveryCharge(true);
        // console.log(promoCodeAppliedOnCartPage);
        // console.log(deliveryCharge);
        const response = await axios.post("/api/sell/sell/add-discount", userData);
        const { status, message, discount } = await response.data;
        console.log({ status, message, discount });
        // addToast(message, { appearance: Number(status) === 0 ? "success" : "error", autoDismiss: true });

        if (Number(status) === 0) {
          dispatch(setPromoAmount(discount));
          dispatch(setPromoType("DELIVERY"));
        } else {
          dispatch(setPromoAmount(0));
          dispatch(setPromoType(""));
          dispatch(setCartPromoCode(null));
        }

        setProcessingDeliveryCharge(false);
      })();
    }
  }, [deliveryCharge, outletSelected]);

  React.useEffect(() => {
    const getCoordinates = async () => {
      setProcessingDeliveryCharge(true);
      const fetchItems = async (stringCoordinates) => {
        try {
          setProcessingDeliveryCharge(true);

          const payload = {
            pickup_id: outletSelected?.outlet_id,
            pickup_gps: outletSelected?.outlet_gps,
            pickup_location: outletSelected?.outlet_address,
            destination_location: deliveryLocationInputted?.value?.description,
            destination_gps: stringCoordinates,
          };

          const res = await axios.post("/api/sell/sell/get-ipay-delivery-charge", payload);

          if (Number(res?.data?.status) === 0) {
            let { data } = await res.data;
            const price = get(data, "price", 0);
            data = { ...data, price: Number(parseFloat(price)) };
            dispatch(setDeliveryCharge(data));
          } else {
            addToast(`We do not deliver to this area. Please select a different area`, { appearance: "error", autoDismiss: true });
            dispatch(setDeliveryLocationInputted(null));
            dispatch(setDeliveryCharge(null));
          }
        } catch (error) {
          let errorResponse = "";
          if (error.response) {
            errorResponse = error.response.data;
          } else if (error.request) {
            errorResponse = error.request;
          } else {
            errorResponse = { error: error.message };
          }
          console.log(errorResponse);
        } finally {
          setProcessingDeliveryCharge(false);
        }
      };

      const stringCoordinates = await getStringCoordinates(deliveryLocationInputted?.value?.description);

      if (stringCoordinates) {
        dispatch(setDeliveryGPS(stringCoordinates));
        await fetchItems(stringCoordinates);
      }
      setProcessingDeliveryCharge(false);
    };

    if (deliveryLocationInputted?.value?.description) {
      getCoordinates();
    }
  }, [dispatch, outletSelected, deliveryLocationInputted]);

  return (
    <div>
      <p>Select Delivery Location</p>
      <div className="flex items-center w-full ">
        <div className={`w-full`}>
          <GooglePlaces
            value={deliveryLocationInputted}
            setValue={(value) => {
              dispatch(setDeliveryLocationInputted(value));
            }}
            selectProps={{
              styles: {
                input: (provided) => ({
                  ...provided,
                  padding: "10px 0",
                }),
                option: (provided) => ({
                  ...provided,
                }),
                singleValue: (provided) => ({
                  ...provided,
                }),
              },
            }}
          />
        </div>

        {processingDeliveryCharge && (
          <div className="ml-2">
            <Spinner type="TailSpin" color="#21428F" width={30} height={30} />
          </div>
        )}
      </div>
    </div>
  );
};

const DeliveryNotes = () => {
  const dispatch = useDispatch();
  const deliveryNotes = useSelector((state) => state.cart.deliveryNotes);

  return (
    <div className="mt-2">
      <p>Delivery Notes</p>
      <input
        value={deliveryNotes}
        onChange={(e) => {
          e.persist();
          dispatch(setDeliveryNotes(e.target.value));
        }}
        type="text"
        placeholder="Enter delivery notes here..."
        className="w-full p-2 bg-white border border-gray-300 rounded placeholder-blueGray-300 text-blueGray-600 focus:ring-1"
      />
    </div>
  );
};

const TypeDelivery = ({ processingDeliveryCharge, setProcessingDeliveryCharge }) => {
  const deliveryTypes = useSelector((state) => state.cart.deliveryTypes);

  if (deliveryTypes["option_delivery"] === "MERCHANT") {
    return (
      <>
        <MerchantDeliveryType processingDeliveryCharge={processingDeliveryCharge} setProcessingDeliveryCharge={setProcessingDeliveryCharge} />{" "}
        <DeliveryNotes />
      </>
    );
  }

  if (deliveryTypes["option_delivery"] === "MERCHANT-DIST") {
    return (
      <>
        <MerchantDistDeliveryType processingDeliveryCharge={processingDeliveryCharge} setProcessingDeliveryCharge={setProcessingDeliveryCharge} />
        <DeliveryNotes />
      </>
    );
  }

  if (deliveryTypes["option_delivery"] === "IPAY") {
    return (
      <>
        <IPAYDeliveryType processingDeliveryCharge={processingDeliveryCharge} setProcessingDeliveryCharge={setProcessingDeliveryCharge} />
        <DeliveryNotes />
      </>
    );
  }

  return null;
};

export default TypeDelivery;

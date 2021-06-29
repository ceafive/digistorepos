import axios from "axios";
import { setDeliveryCharge, setDeliveryTypes } from "features/cart/cartSlice";
import { filter, get } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import GooglePlaces from "./GooglePlaces";
import Spinner from "./Spinner";

const Box = ({ option }) => {
  const dispatch = useDispatch();
  return (
    <div key={option.delivery_location}>
      <button
        key={option.delivery_location}
        className="w-48 h-48 border border-gray-300 rounded shadow overflow-hidden font-bold px-2 break-words"
        onClick={() => {
          const price = get(option, "delivery_price", 0);
          const data = { ...option, delivery_price: Number(parseFloat(price)) };
          //   console.log(data);

          dispatch(setDeliveryCharge(data));
        }}
      >
        {option?.delivery_location} {" - "} {option?.delivery_price}
      </button>
    </div>
  );
};

const MerchantDeliveryType = () => {
  const dispatch = useDispatch();
  const [listOfValues, setListOfValues] = React.useState([]);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const res = await axios.post("/api/products/get-delivery-lov", { user });
        const { data } = await res.data;
        console.log({ data });

        setListOfValues(data);
      } catch (error) {
        console.log(error);
      } finally {
      }
    };

    fetchItems();
  }, [dispatch]);

  return (
    <div className="mt-4">
      <h1 className="font-semibold mb-1">Select Delivery Location</h1>
      <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 xl:gap-2">
        {listOfValues.map((option, index) => {
          return <Box key={index} option={option} />;
        })}
      </div>
    </div>
  );
};

const IPAYDeliveryType = () => {
  const dispatch = useDispatch();
  const outletSelected = useSelector((state) => state.products.outletSelected);
  //   console.log(outletSelected);
  const [value, setValue] = React.useState(null);
  // console.log(value);

  React.useEffect(() => {
    const getCoordinates = async () => {
      const response = await axios.post("/api/products/get-coordinates", { description: value?.value?.description });
      const responsedata = await response.data;
      const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`;

      const fetchItems = async (stringCoordinates) => {
        try {
          const payload = {
            pickup_id: outletSelected?.outlet_id,
            pickup_gps: outletSelected?.outlet_gps,
            pickup_location: outletSelected?.outlet_address,
            destination_location: value?.value?.description,
            destination_gps: stringCoordinates,
          };

          //   console.log({ payload });

          const res = await axios.post("/api/products/get-ipay-delivery-charge", payload);
          //   console.log(res);

          let { data } = await res.data;
          const price = get(data, "price", 0);
          data = { ...data, price: Number(parseFloat(price)) };
          //   console.log(data);

          dispatch(setDeliveryCharge(data));
        } catch (error) {
          console.log(error);
        } finally {
        }
      };

      if (stringCoordinates) {
        fetchItems(stringCoordinates);
      }
    };

    if (value?.value?.description) {
      getCoordinates();
    }
  }, [dispatch, outletSelected?.outlet_address, outletSelected?.outlet_gps, outletSelected?.outlet_id, value]);

  return (
    <div>
      <p>Select Delivery Location</p>
      <GooglePlaces
        value={value}
        setValue={setValue}
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
  );
};

const MerchantDistDeliveryType = ({ setFetching }) => {
  const dispatch = useDispatch();
  const outletSelected = useSelector((state) => state.products.outletSelected);
  //   console.log(outletSelected);
  const [value, setValue] = React.useState(null);
  //   console.log(value);

  React.useEffect(() => {
    const getCoordinates = async () => {
      const response = await axios.post("/api/products/get-coordinates", { description: value?.value?.description });
      const responsedata = await response.data;
      const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`;

      const fetchItems = async (stringCoordinates) => {
        try {
          setFetching(true);
          let user = sessionStorage.getItem("IPAYPOSUSER");
          user = JSON.parse(user);

          const payload = {
            merchant: user["user_merchant_id"],
            pickup_gps: outletSelected?.outlet_gps,
            destination_gps: stringCoordinates,
          };
          //   console.log({ payload });

          const res = await axios.post("/api/products/get-merchant-dist-charge", payload);
          //   console.log(res);

          let { delivery } = await res.data;
          const price = get(delivery, "delivery_price", 0);
          delivery = { ...delivery, price: Number(parseFloat(price)) };
          //   console.log(delivery);

          dispatch(setDeliveryCharge(delivery));
        } catch (error) {
          console.log(error);
        } finally {
          setFetching(false);
        }
      };

      if (stringCoordinates) {
        fetchItems(stringCoordinates);
      }
    };

    if (value?.value?.description) {
      getCoordinates();
    }
  }, [dispatch, outletSelected?.outlet_address, outletSelected?.outlet_gps, outletSelected?.outlet_id, setFetching, value]);

  return (
    <div>
      <p>Select Delivery Location</p>
      <GooglePlaces value={value} setValue={setValue} />
    </div>
  );
};

const TypeDelivery = () => {
  const dispatch = useDispatch();
  const deliveryTypes = useSelector((state) => state.cart.deliveryTypes);
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const deliveryTypesRes = await axios.post("/api/products/get-delivery-type", { user });
        const { data: deliveryTypesResData } = await deliveryTypesRes.data;
        dispatch(setDeliveryTypes(deliveryTypesResData));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch]);

  if (fetching) {
    return null;
  }

  if (deliveryTypes["option_delivery"] === "MERCHANT") {
    return <MerchantDeliveryType />;
  }

  if (deliveryTypes["option_delivery"] === "IPAY") {
    return <IPAYDeliveryType />;
  }

  if (deliveryTypes["option_delivery"] === "MERCHANT-DIST") {
    return <MerchantDistDeliveryType />;
  }

  return null;
};

export default TypeDelivery;

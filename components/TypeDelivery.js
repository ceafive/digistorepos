import axios from "axios";
import { setDeliveryCharge } from "features/cart/cartSlice";
import { get } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import GooglePlaces from "./GooglePlaces";
import Spinner from "./Spinner";

const MerchantDeliveryType = ({ setFetching }) => {
  const dispatch = useDispatch();
  const [listOfValues, setListOfValues] = React.useState([]);

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        let user = sessionStorage.getItem("IPAYPOSUSER");
        user = JSON.parse(user);

        const res = await axios.post("/api/products/get-delivery-lov", { user });
        const { data } = await res.data;
        console.log({ data });
        setListOfValues(data);
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [dispatch, setFetching]);

  return (
    <div>
      {listOfValues.map((value) => {
        return <p key={value}>{value}</p>;
      })}
    </div>
  );
};

const IPAYDeliveryType = ({ setFetching }) => {
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
          setFetching(true);

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
  const deliveryTypes = useSelector((state) => state.cart.deliveryTypes);

  // Compnent State
  const [fetching, setFetching] = React.useState(false);

  //   if (!fetching) {
  //     return <Spinner type="TailSpin" width={50} height={50} />;
  //   }

  if (deliveryTypes["option_delivery"] === "MERCHANT") {
    return <MerchantDeliveryType />;
  }

  if (deliveryTypes["option_delivery"] === "IPAY") {
    return <IPAYDeliveryType setFetching={setFetching} />;
  }

  if (deliveryTypes["option_delivery"] === "MERCHANT-DIST") {
    return <MerchantDistDeliveryType setFetching={setFetching} />;
  }

  return <div>Type Delivery</div>;
};

export default TypeDelivery;

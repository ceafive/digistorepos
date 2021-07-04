import axios from "axios"
import { setDeliveryCharge, setDeliveryGPS, setDeliveryLocationInputted, setDeliveryNotes } from "features/cart/cartSlice"
import { get } from "lodash"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import GooglePlaces from "./GooglePlaces"
import Spinner from "./Spinner"

const Box = ({ option }) => {
  const dispatch = useDispatch()
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge)
  // console.log(deliveryCharge);

  return (
    <div key={option.delivery_location}>
      <button
        key={option.delivery_location}
        className={`${
          deliveryCharge?.delivery_code === option?.delivery_code ? "ring-1" : ""
        } w-full h-10 border border-gray-300 rounded overflow-hidden font-bold px-2 break-words focus:outline-none`}
        onClick={() => {
          const price = get(option, "delivery_price", 0)
          const data = { ...option, price: Number(parseFloat(price)) }
          // console.log(data);
          dispatch(setDeliveryLocationInputted(option.delivery_location))
          dispatch(setDeliveryCharge(data))
        }}>
        {option?.delivery_location} {" - "} GHS{option?.delivery_price}
      </button>
    </div>
  )
}

const MerchantDeliveryType = ({ fetching, setFetching }) => {
  const dispatch = useDispatch()

  const [listOfValues, setListOfValues] = React.useState([])

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true)
        let user = sessionStorage.getItem("IPAYPOSUSER")
        user = JSON.parse(user)

        const res = await axios.post("/api/sell/get-delivery-lov", { user })
        const { data } = await res.data
        // console.log({ data });

        const cleanData = Array.isArray(data) ? data.filter((eachData) => Boolean(eachData)) : []
        setListOfValues(cleanData)
      } catch (error) {
        console.log(error)
      } finally {
        setFetching(false)
      }
    }

    fetchItems()
  }, [dispatch])

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center w-full mt-2">
        <Spinner type="TailSpin" width={30} height={30} />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p>Select Delivery Location</p>
      {listOfValues.map((option, index) => {
        return <Box key={index} option={option} />
      })}
    </div>
  )
}

const IPAYDeliveryType = ({ fetching, setFetching }) => {
  const dispatch = useDispatch()
  const outletSelected = useSelector((state) => state.products.outletSelected)
  const deliveryLocationInputted = useSelector((state) => state.products.deliveryLocationInputted)
  //   console.log(outletSelected);
  const [value, setValue] = React.useState(null)
  // console.log(value);

  React.useEffect(() => {
    dispatch(setDeliveryLocationInputted(value))
  }, [dispatch, value])

  React.useEffect(() => {
    const getCoordinates = async () => {
      setFetching(true)
      const response = await axios.post("/api/sell/get-coordinates", { description: value?.value?.description })
      const responsedata = await response.data
      const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`

      const fetchItems = async (stringCoordinates) => {
        try {
          const payload = {
            pickup_id: outletSelected?.outlet_id,
            pickup_gps: outletSelected?.outlet_gps,
            pickup_location: outletSelected?.outlet_address,
            destination_location: value?.value?.description,
            destination_gps: stringCoordinates
          }

          //   console.log({ payload });

          const res = await axios.post("/api/sell/get-ipay-delivery-charge", payload)
          //   console.log(res);

          let { data } = await res.data
          const price = get(data, "price", 0)
          data = { ...data, price: Number(parseFloat(price)) }
          //   console.log(data);

          dispatch(setDeliveryCharge(data))
        } catch (error) {
          console.log(error)
        } finally {
        }
      }

      if (stringCoordinates) {
        dispatch(setDeliveryGPS(stringCoordinates))
        await fetchItems(stringCoordinates)
      }

      setFetching(false)
    }

    if (value?.label) {
      getCoordinates()
    }
  }, [dispatch, outletSelected?.outlet_address, outletSelected?.outlet_gps, outletSelected?.outlet_id, setFetching, value])

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center w-full mt-2">
        <Spinner type="TailSpin" width={30} height={30} />
      </div>
    )
  }

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
              padding: "10px 0"
            }),
            option: (provided) => ({
              ...provided
            }),
            singleValue: (provided) => ({
              ...provided
            })
          }
        }}
      />
    </div>
  )
}

const MerchantDistDeliveryType = ({ fetching, setFetching }) => {
  const dispatch = useDispatch()
  const outletSelected = useSelector((state) => state.products.outletSelected)
  //   console.log(outletSelected);
  const [value, setValue] = React.useState(null)
  //   console.log(value);

  React.useEffect(() => {
    dispatch(setDeliveryLocationInputted(value))
  }, [dispatch, value])

  React.useEffect(() => {
    const getCoordinates = async () => {
      setFetching(true)
      const response = await axios.post("/api/sell/get-coordinates", { description: value?.value?.description })
      const responsedata = await response.data
      const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`

      const fetchItems = async (stringCoordinates) => {
        try {
          let user = sessionStorage.getItem("IPAYPOSUSER")
          user = JSON.parse(user)

          const payload = {
            merchant: user["user_merchant_id"],
            pickup_gps: outletSelected?.outlet_gps,
            destination_gps: stringCoordinates
          }
          //   console.log({ payload });

          const res = await axios.post("/api/sell/get-merchant-dist-charge", payload)
          //   console.log(res);

          let { delivery } = await res.data
          const price = get(delivery, "delivery_price", 0)
          delivery = { ...delivery, price: Number(parseFloat(price)) }
          //   console.log(delivery);

          dispatch(setDeliveryCharge(delivery))
        } catch (error) {
          console.log(error)
        } finally {
        }
      }

      if (stringCoordinates) {
        dispatch(setDeliveryGPS(stringCoordinates))
        await fetchItems(stringCoordinates)
      }
      setFetching(false)
    }

    if (value?.value?.description) {
      getCoordinates()
    }
  }, [dispatch, outletSelected?.outlet_address, outletSelected?.outlet_gps, outletSelected?.outlet_id, setFetching, value])

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center w-full mt-2">
        <Spinner type="TailSpin" width={30} height={30} />
      </div>
    )
  }

  return (
    <div>
      <p>Select Delivery Location</p>
      <GooglePlaces value={value} setValue={setValue} />
    </div>
  )
}

const DeliveryNumber = ({ register }) => {
  const dispatch = useDispatch()
  const deliveryNotes = useSelector((state) => state.cart.deliveryNotes)
  return (
    <div className="mt-2">
      <p>Delivery Notes</p>
      <input
        value={deliveryNotes}
        onChange={(e) => {
          e.persist()
          dispatch(setDeliveryNotes(e.target.value))
        }}
        type="text"
        placeholder="Enter delivery notes here..."
        className="p-2 py-3 text-lg placeholder-blueGray-300 text-blueGray-600 border border-gray-300 bg-white rounded outline-none focus:outline-none focus:ring-1 w-full"
      />
    </div>
  )
}

const TypeDelivery = () => {
  const dispatch = useDispatch()
  const deliveryTypes = useSelector((state) => state.cart.deliveryTypes)
  const [fetching, setFetching] = React.useState(false)

  if (deliveryTypes["option_delivery"] === "MERCHANT") {
    return <MerchantDeliveryType fetching={fetching} setFetching={setFetching} />
  }

  if (deliveryTypes["option_delivery"] === "IPAY") {
    return (
      <>
        <IPAYDeliveryType fetching={fetching} setFetching={setFetching} />
        <DeliveryNumber />
      </>
    )
  }

  if (deliveryTypes["option_delivery"] === "MERCHANT-DIST") {
    return (
      <>
        <MerchantDistDeliveryType fetching={fetching} setFetching={setFetching} />
        <DeliveryNumber />
      </>
    )
  }

  return null
}

export default TypeDelivery

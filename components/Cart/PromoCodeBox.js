import Spinner from "components/Spinner"
import React from "react"

const PromoCodeBox = ({ checking, promoCode, setPromoCode, checkingPromoCode, setShowPromoCodeBox }) => {
  return (
    <div className="font-medium bg-white z-10 w-full h-38 rounded shadow border border-gray-500 overflow-hidden">
      <div className="h-full">
        <p className="font-bold mt-2 px-2">Promo Code</p>
        <hr />
        <div className="flex items-center mt-4 px-2">
          <input
            value={promoCode}
            onChange={(e) => {
              e.persist()
              setPromoCode(e.target.value)
            }}
            type="text"
            className="appearance-none border border-gray-200 placeholder-blueGray-300 text-blueGray-600 rounded text-sm outline-none focus:outline-none w-full"
          />
        </div>

        <div className="flex justify-end w-full bg-gray-300 mt-2 p-2">
          <button
            className="text-white font-bold bg-red-700 px-3 py-1 mr-2 rounded"
            onClick={() => {
              setShowPromoCodeBox(false)
              // dispatch(onChangeCartDiscountType("percent"));
            }}>
            Cancel
          </button>
          <div className="text-center">
            <button
              disabled={checking || !promoCode}
              className={`${
                checking ? "bg-gray-300 text-gray-200" : "bg-green-500 text-white"
              } font-bold px-3 py-1  rounded focus:outline-none ease-linear transition-all duration-150`}
              type="button"
              onClick={() => {
                checkingPromoCode()
              }}>
              {checking && (
                <div className="inline-block mr-2">
                  <Spinner type={"TailSpin"} color="black" width="10" height="10" />
                </div>
              )}
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromoCodeBox

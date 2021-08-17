import Spinner from "components/Spinner";
import React from "react";

const PromoCodeBox = ({ checking, promoCode, setPromoCode, checkingPromoCode, setShowPromoCodeBox }) => {
  return (
    <div className="z-10 w-full overflow-hidden font-medium bg-white border border-gray-500 rounded shadow h-38">
      <div className="h-full">
        <p className="px-2 mt-2 font-bold">Promo Code</p>
        <hr />
        <div className="flex items-center px-2 mt-4">
          <input
            value={promoCode}
            onChange={(e) => {
              e.persist();
              setPromoCode(e.target.value);
            }}
            type="text"
            className="w-full text-sm border border-gray-200 rounded outline-none appearance-none placeholder-blueGray-300 text-blueGray-600 focus:outline-none"
          />
        </div>

        <div className="flex justify-end w-full p-2 mt-2 bg-gray-300">
          <button
            disabled={checking || !promoCode}
            className="px-3 py-1 mr-2 font-bold text-white bg-red-700 rounded"
            onClick={() => {
              setShowPromoCodeBox(false);
              // dispatch(onChangeCartDiscountType("percent"));
            }}
          >
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
                checkingPromoCode();
              }}
            >
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
  );
};

export default PromoCodeBox;

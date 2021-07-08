import React from "react";

import Spinner from "./Spinner";

const ButtonSpinner = ({ processing, onClick, btnText, containerClasses, btnClasses, textClasses }) => {
  return (
    <div className={`text-center mt-6 ${containerClasses}`}>
      <button
        disabled={processing}
        className={`${
          processing ? "bg-gray-300 text-gray-200" : "bg-blueGray-800 text-white"
        } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150 ${btnClasses}`}
        type="button"
        onClick={onClick}
      >
        {processing && (
          <div className="inline-block mr-2">
            <Spinner type={"TailSpin"} color="black" width={30} height={30} />
          </div>
        )}
        <span className={`${textClasses}`}>{btnText}</span>
      </button>
    </div>
  );
};

export default ButtonSpinner;

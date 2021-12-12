import React from "react";

export default function FooterSmall(props) {
  return (
    <>
      <footer className={(props.absolute ? "absolute w-full bottom-0 bg-blueGray-500" : "relative") + " pb-6"}>
        <div className="container mx-auto px-4">
          <hr className="mb-6 border-b-1 border-blueGray-600" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full px-4">
              <div className="text-sm text-blueGray-100 font-semibold py-1 text-center">
                Copyright © {new Date().getFullYear()}{" "}
                <a
                  href="https://sell.digistoreafrica.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blueGray-300 hover:text-blueGray-900 text-sm font-semibold py-1"
                >
                  Digistore Africa
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

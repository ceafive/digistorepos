/* This example requires Tailwind CSS v2.0+ */

import { useRouter } from "next/router";
import React from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example({ buttons }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [linkActive, setLinkActive] = React.useState(null);

  return (
    <div className="relative inline-block text-left">
      <div>
        <div>
          <button
            className="inline-flex items-center justify-center w-full py-2 text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none"
            onClick={() => {
              setIsOpen((data) => !data);
            }}
          >
            Options
            <i className={`fas fa-chevron-${isOpen ? "down" : "right"} -mr-1 ml-2`} aria-hidden="true" />
          </button>
        </div>
        {isOpen && (
          <div
            className={`${
              isOpen ? "h-auto" : "h-0"
            } origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-2 ring-black ring-opacity-5 divide-y transition-all duration-150 ease-out mb-10 overflow-hidden z-20`}
            style={{ zIndex: 999999999 }}
          >
            {buttons().map((button) => {
              return (
                <button
                  key={button.name}
                  className={classNames(
                    linkActive === button.name ? "bg-gray-100 text-gray-900" : `text-gray-700 `,
                    `block px-4 py-2 text-sm w-full font-semibold focus:outline-none ${button?.classes}`
                  )}
                  onClick={() => {
                    setLinkActive(button.name);
                    button.action();
                    setIsOpen(false);
                  }}
                >
                  {button.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

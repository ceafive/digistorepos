import FooterSmall from "components/Footers/FooterSmall.js";
import React from "react";

export default function Auth({ children }) {
  return (
    <>
      <main>
        <section className="relative w-full h-full pt-40 py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-white bg-no-repeat bg-full"
            style={{
              backgroundImage: "url('/img/register_bg_2.png')",
            }}></div>
          {children}
          <FooterSmall absolute />
        </section>
      </main>
    </>
  );
}

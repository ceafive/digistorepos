import Admin from "layouts/Admin.js";
import useTranslation from "next-translate/useTranslation";
import React from "react";

export default function HomeMain() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full w-full min-h-screen-75">
        <p className="font-bold text-6xl">{t("common:greeting")}</p>
      </div>
    </>
  );
}

HomeMain.layout = Admin;

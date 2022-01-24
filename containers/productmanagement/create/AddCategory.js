import axios from "axios";
import Spinner from "components/Spinner";
import { setManageProductCategories, setShowAddCategoryModal } from "features/manageproducts/manageproductsSlice";
import { filter } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";

const AddCategory = ({
  btnText = "Add New Category",
  processing,
  setProcessing,
  setValue,
  action = null,
  isEditing,
  setIsEditing,
  addCatValues = {},
}) => {
  const { addToast, removeToast } = useToasts();
  const dispatch = useDispatch();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
    setValue: addCategorySetValue,
  } = useForm({
    defaultValues: {
      ...addCatValues,
    },
  });

  const postNewCategory = async (values, user) => {
    const data = {
      name: values?.categoryName,
      desc: values?.categoryDescription,
      merchant: user?.user_merchant_id,
      mod_by: user?.login,
    };

    const response = await axios.post("/api/products/add-product-category", data);
    const { status, message } = await response.data;
    return { data, status, message };
  };

  const getNewCategories = async (status, message, user) => {
    if (status === 0) {
      reset({
        categoryName: "",
        categoryDescription: "",
      });

      const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
      const { data: allCategoriesResData } = await allCategoriesRes.data;
      const filtered = filter(allCategoriesResData, (o) => Boolean(o));
      dispatch(setManageProductCategories(filtered));
      return filtered;
    } else addToast(`${message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
  };

  const sumbitNewCategoryToServer = async (values) => {
    try {
      setProcessing(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const { data, status, message } = await postNewCategory(values, user);
      await getNewCategories(status, message, user, data).then((filtered) => {
        const found = filtered.find((o) => o?.product_category === data?.name);
        setValue("productCategory", found?.product_category_id ?? ""); // add new cateogry and select it
        addToast(message, { appearance: "success", autoDismiss: true });
        dispatch(setShowAddCategoryModal());
      });
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      console.log(errorResponse);
      setProcessing(false);
    } finally {
      setProcessing(false);
    }
  };

  const addNewCategory = async (values) => {
    try {
      setProcessing(true);
      addToast(`Adding....`, { appearance: "info", id: "notif-sending" });
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const data = {
        name: values?.categoryName,
        desc: values?.categoryDescription,
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      const response = await axios.post("/api/products/add-product-category", data);
      const { status, message } = await response.data;
      removeToast("notif-sending");

      if (status === 0) {
        reset({
          categoryName: "",
          categoryDescription: "",
        });

        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const filtered = filter(allCategoriesResData, (o) => Boolean(o));
        dispatch(setManageProductCategories(filtered));

        addToast(message, { appearance: "success", autoDismiss: true });
        dispatch(setShowAddCategoryModal());
      } else addToast(`${message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      addToast(`${errorResponse}. Fix error and try again`, { appearance: "error", autoDismiss: true });
    } finally {
      setProcessing(false);
    }
  };

  const updateCategory = async (values) => {
    try {
      setProcessing(true);
      addToast(`Updating....`, { appearance: "info", id: "notif-sending" });
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const data = {
        id: values?.categoryID,
        name: values?.categoryName,
        desc: values?.categoryDescription,
        mod_by: user?.login,
      };

      const response = await axios.post("/api/products/update-product-category", data);
      const { status, message } = await response.data;
      removeToast("notif-sending");

      if (status === 0) {
        const allCategoriesRes = await axios.post("/api/products/get-product-categories", { user });
        const { data: allCategoriesResData } = await allCategoriesRes.data;
        const filtered = filter(allCategoriesResData, (o) => Boolean(o));
        dispatch(setManageProductCategories(filtered));

        addToast(message, { appearance: "success", autoDismiss: true });
        addCategorySetValue("categoryName", "");
        addCategorySetValue("categoryDescription", "");
        addCategorySetValue("categoryID", "");
        setIsEditing(false);
        dispatch(setShowAddCategoryModal());
      } else addToast(`${message}. Fix error and try again`, { appearance: "error", autoDismiss: true });
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      addToast(`${errorResponse}. Fix error and try again`, { appearance: "error", autoDismiss: true });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full p-5">
      <div className="w-full mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Category Name</label>
        <input
          type="text"
          placeholder="Luxury"
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
          {...register("categoryName", { required: "Please enter a category name" })}
        />
        <p className="text-red-500 text-left text-xs italic mt-1">{errors?.categoryName?.message}</p>
      </div>
      <div className="w-full mb-6 md:mb-2">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Category Description</label>
        <textarea
          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          rows={4}
          {...register("categoryDescription")}
        />
      </div>

      <div className="flex justify-center mt-8">
        <button
          disabled={processing}
          className={`${
            processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
          } active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
          onClick={() => handleSubmit(action ? (isEditing ? updateCategory : addNewCategory) : sumbitNewCategoryToServer)()}
        >
          {processing && (
            <div className="inline-block mr-2">
              <Spinner type={"TailSpin"} color="black" width="10" height="10" />
            </div>
          )}
          <span>{btnText}</span>
        </button>
      </div>
    </div>
  );
};

export default AddCategory;

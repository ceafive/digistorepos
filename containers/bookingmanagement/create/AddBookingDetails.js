import axios from "axios";
import Modal from "components/Modal";
import { setManageProductCategories, setProductWithVariants, setShowAddCategoryModal } from "features/manageproducts/manageproductsSlice";
import { filter } from "lodash";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import DayPickerComponent from "../DayPickerComponent";
import AddCategory from "./AddCategory";
import UploadImage from "./UploadImage";

const AddBookingDetails = ({ setGoToVarianceConfig }) => {
  const router = useRouter();
  const { addToast } = useToasts();
  const dispatch = useDispatch();

  // redux
  const productWithVariants = useSelector((state) => state.manageproducts.productWithVariants);
  const manageProductCategories = useSelector((state) => state.manageproducts.manageProductCategories);
  const manageProductOutlets = useSelector((state) => state.manageproducts.manageProductOutlets);
  const showAddCategoryModal = useSelector((state) => state.manageproducts.showAddCategoryModal);

  // console.log(productWithVariants);

  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      ...productWithVariants,
    },
  });

  const {
    register: addCategoryRegister,
    reset: addCategoryReset,
    formState: { errors: addCategoryErrors },
    handleSubmit: addCategoryHandleSumbit,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: availableDatesFields,
    append: availableDatesAppend,
    remove: availableDatesRemove,
  } = useFieldArray({
    control,
    name: "availableDates",
  });

  const { fields: availableDaysFields, append: availableDaysAppend } = useFieldArray({
    control,
    name: "availableDays",
  });

  const [processing, setProcessing] = React.useState(false);
  const [images, setImages] = React.useState(productWithVariants?.productImages ?? []);
  const [availableDates, setAvailableDates] = useState(productWithVariants?.availableDates?.length ? true : false);

  const productCategory = watch("productCategory", false);

  const createproductWithVariants = (values) => {
    try {
      // console.log(values);
      dispatch(setProductWithVariants(values));
      setGoToVarianceConfig(true);
    } catch (error) {
      console.log(error);
    }
  };

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
      addCategoryReset({
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
      await getNewCategories(status, message, user).then((filtered) => {
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

  const buttonParams = React.useMemo(() => {
    return {
      buttonText: "Proceed",
      buttonAction: handleSubmit(createproductWithVariants),
    };
  }, []);

  React.useEffect(() => {
    if (fields.length === 0) append({});

    if (availableDaysFields.length === 0) {
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
        availableDaysAppend({
          day,
          duration: "",
          isClosed: false,
        });
      });
    }
  }, []);

  React.useEffect(() => {
    if (productCategory === "addNewCategory") {
      dispatch(setShowAddCategoryModal());
    }
  }, [productCategory]);

  return (
    <>
      <Modal open={showAddCategoryModal} onClose={() => dispatch(setShowAddCategoryModal())} maxWidth="sm">
        <AddCategory
          addCategoryRegister={addCategoryRegister}
          processing={processing}
          addCategoryErrors={addCategoryErrors}
          addCategoryHandleSumbit={addCategoryHandleSumbit}
          action={sumbitNewCategoryToServer}
        />
      </Modal>
      <button
        className="focus:outline-none font-bold"
        onClick={() => {
          router.back();
        }}
      >
        Back
      </button>
      <h1>Setup Booking</h1>
      <div className="flex w-full h-full">
        <div className="w-7/12 xl:w-8/12 pb-6 pt-12 px-4">
          <div>
            <h1 className="font-bold text-blue-700">Booking Details</h1>
            <div className="flex w-full justify-between items-center">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Name</label>
                <input
                  {...register("productName", { required: "Name is required" })}
                  type="text"
                  placeholder="Malaria Test"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none focus:ring-1 w-full mb-2"
                />
                <p className="text-xs text-red-500">{errors["productName"]?.message}</p>
              </div>

              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">Category</label>
                <select
                  {...register("productCategory", { required: "Category is required" })}
                  className="block appearance-none w-full border border-gray-200 text-gray-700 py-2 rounded focus:outline-none text-sm bg-white mb-2"
                >
                  <option value="">{`Select Category`}</option>
                  {manageProductCategories?.map((category) => {
                    return (
                      <option key={category?.product_category_id} value={category?.product_category_id}>
                        {category?.product_category}
                      </option>
                    );
                  })}
                  <option value="addNewCategory">{`Add New Category`}</option>;
                </select>
                <p className="text-xs text-red-500">{errors["productCategory"]?.message}</p>
              </div>
            </div>

            <div className="flex w-full justify-between mt-4">
              <div className="w-1/2 mr-2">
                <label className="text-sm leading-none  font-bold">Description (Optional)</label>
                <textarea
                  {...register("productDescription", { required: false })}
                  type="text"
                  rows={4}
                  placeholder="Enter a short description"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                />
              </div>
              <div className="w-1/2">
                <label className="text-sm leading-none  font-bold">Fee</label>
                <input
                  {...register("sellingPrice", { required: "Fee is required" })}
                  type="number"
                  placeholder="12"
                  min="1"
                  className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                />
                <p className="text-xs text-red-500">{errors["sellingPrice"]?.message}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between w-full my-4">
              <div className="w-1/2">
                <h1 className="font-bold text-blue-700">Available Dates</h1>
                <div className="flex items-center">
                  <input
                    checked={availableDates}
                    onChange={(e) => {
                      setAvailableDates(e.target.checked);
                      if (e.target.checked) {
                        availableDatesAppend({
                          from: "",
                          to: "",
                        });
                      } else availableDatesRemove();
                    }}
                    type="checkbox"
                    className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                  />
                  <label className="text-sm leading-none font-bold">Set Available Dates</label>
                </div>

                {availableDates && (
                  <div className="mt-2">
                    <div className="">
                      {availableDatesFields.map(({ id }, index) => {
                        return (
                          <div key={id} className=" my-1">
                            <div key={id} className="flex">
                              <div className="">
                                <label className="text-xs leading-none font-bold">Date Range</label>
                                <DayPickerComponent index={index} control={control} availableDates={availableDates} />
                              </div>

                              <div className="flex mt-1">
                                {availableDatesFields.length > 1 && (
                                  <div
                                    className="flex items-center font-bold bg-red-500 rounded py-1 px-4 ml-2 mt-4 cursor-pointer"
                                    onClick={() => {
                                      availableDatesRemove(index);
                                    }}
                                  >
                                    <button className="focus:outline-none">
                                      <i className="fas fa-trash-alt text-white"></i>
                                    </button>
                                  </div>
                                )}

                                <div
                                  className="flex items-center font-bold bg-green-500 rounded py-1 px-4 ml-2 mt-4 cursor-pointer"
                                  onClick={() => {
                                    availableDatesAppend({
                                      from: "",
                                      to: "",
                                    });
                                  }}
                                >
                                  <button className="focus:outline-none">
                                    <i className="fas fa-plus text-white" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <hr className="mt-3" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-1/2">
                <h1 className="font-bold text-blue-700">Available Days</h1>
                <div className="w-full">
                  {availableDaysFields.map((data, index) => {
                    const { id, day, duration, isClosed } = data;
                    // console.log(data);
                    // console.log(isClosed);

                    return (
                      <div key={id} className="w-full">
                        <div key={id} className="flex items-center w-full">
                          <div className=" mr-2">
                            <label className="text-xs leading-none font-bold">Day</label>
                            <input
                              {...register(`availableDays[${index}].day`, {})}
                              defaultValue={day}
                              type="text"
                              disabled={true}
                              className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm outline-none focus:outline-none focus:ring-1 w-full mb-2"
                            />
                          </div>
                          <div className="">
                            <label className="text-xs leading-none font-bold">Duration</label>
                            <input
                              {...register(`availableDays[${index}].duration`, {
                                validate: (value) => (isClosed ? true : Boolean(value) || "Duration must be entered"),
                              })}
                              defaultValue={duration}
                              type="text"
                              placeholder="eg. 08:00AM - 09:00AM"
                              disabled={isClosed}
                              className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                            />
                            {errors[`availableDays`] && errors[`availableDays`][index] && (
                              <p className="text-xs text-red-500 -mt-2">{errors[`availableDays`][index]?.duration?.message}</p>
                            )}
                          </div>

                          <div className="flex items-center ml-4">
                            <input
                              {...register(`availableDays[${index}].isClosed`, {
                                deps: [`availableDays[${index}].duration`],
                              })}
                              type="checkbox"
                              className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                            />
                            <label className="text-sm leading-none font-bold">Closed?</label>
                          </div>
                        </div>
                        <hr className="my-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="w-full mr-2 mt-2 bg-gray-200 p-6 rounded">
              <h1>Multiple slots of the same booking which customers can choose from eg. Time</h1>
              <hr className="text-blue-500 bg-blue-500" />
              <div className="mt-2">
                <div className="flex flex-wrap justify-center items-center w-full">
                  {fields.map(({ id, name, values }, index) => {
                    return (
                      <div key={id} className="w-full my-3">
                        <div key={id} className="flex w-full justify-between items-center">
                          <div className=" mr-2">
                            <label className="text-xs leading-none font-bold">Variant Name</label>
                            <input
                              {...register(`variants[${index}].name`, {
                                validate: (value) => Boolean(value) || "Variant name must be entered",
                              })}
                              defaultValue={name}
                              type="text"
                              placeholder="eg. Time"
                              className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                            />
                            {errors[`variants`] && errors[`variants`][index] && (
                              <p className="text-xs text-red-500">{errors[`variants`][index]?.name?.message}</p>
                            )}
                          </div>

                          <div className="">
                            <label className="text-xs leading-none font-bold">
                              Variant Values <span className="text-xs">(Separated by comma ",")</span>
                            </label>
                            <input
                              {...register(`variants[${index}].values`, {
                                validate: (value) => Boolean(value) || "Variant values must be entered",
                              })}
                              defaultValue={values}
                              type="text"
                              placeholder="eg. 08:00AM - 09:00AM, 09:00AM - 10:00AM, 10:00AM - 11:00AM"
                              className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm  outline-none focus:outline-none focus:ring-1 w-full mb-2"
                            />
                            {errors[`variants`] && errors[`variants`][index] && (
                              <p className="text-xs text-red-500">{errors[`variants`][index]?.values?.message}</p>
                            )}
                          </div>

                          <div className="w-1/5 flex mt-4">
                            {fields.length > 1 && (
                              <div
                                className="font-bold bg-red-500 rounded h-full py-1 px-4 ml-4 mt-4 cursor-pointer"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                <button className="justify-self-end focus:outline-none">
                                  <i className="fas fa-trash-alt text-white"></i>
                                </button>
                              </div>
                            )}

                            {/* {fields?.length < 5 && index === fields.length - 1 && (
                              <div
                                className="flex font-bold bg-green-500 rounded py-1 px-4 ml-2 cursor-pointer"
                                onClick={() => {
                                  append({});
                                }}
                              >
                                <button className="justify-self-end focus:outline-none">
                                  <i className="fas fa-plus text-white" />
                                </button>
                              </div>
                            )} */}
                          </div>
                        </div>
                        <hr />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Variants */}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-5/12 xl:w-4/12 pb-6 pt-12 px-4">
          <div className="bg-gray-200 p-2 pt-0 rounded">
            <h1 className="font-bold">Booking Gallery</h1>
            <hr className="border-gray-500" />
            <p className="my-2 text-sm font-bold text-gray-600">Upload Booking images, max of 4 images (Optional)</p>
            <p className="mt-2 text-sm font-bold text-red-500">Minimum Size: 800x800</p>

            <div className="bg-white m-2" style={{ height: 200 }}>
              <div className="flex flex-col justify-center items-center border border-gray-200 h-full w-full">
                <UploadImage classes="" setValue={setValue} images={images} setImages={setImages} />
              </div>
            </div>
          </div>

          <div className="bg-gray-200 p-2 pt-0 rounded mt-4">
            <h1 className="font-bold">Outlets</h1>
            <hr className="border-gray-500" />
            <p className="my-2 text-sm font-bold text-gray-600">
              Add products to outlets
              <span className="text-xs">(You can select multiple outlets)</span>
            </p>

            <div className="bg-white m-2 p-2 overflow-y-scroll overflow-x-hidden" style={{ height: 200 }}>
              {manageProductOutlets?.map((outlet) => {
                return (
                  <div key={outlet?.outlet_id} className="w-full">
                    <input
                      {...register("outlets", { required: "Outlet selection is required" })}
                      type="checkbox"
                      value={outlet?.outlet_id}
                      className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                    />
                    <label className="text-sm font-bold mt-2">{outlet?.outlet_name}</label>
                  </div>
                );
              })}
            </div>
            <p className="my-1 text-xs text-red-500">{errors?.outlets?.message}</p>
          </div>

          <div className="mt-4">
            <button
              className="bg-green-800  text-white px-6 py-3 w-full rounded font-semibold uppercase focus:outline-none"
              onClick={() => {
                buttonParams.buttonAction();
              }}
            >
              <span>{buttonParams.buttonText}</span>
            </button>
          </div>
        </div>
        {/* Right Side */}
      </div>
    </>
  );
};

export default AddBookingDetails;

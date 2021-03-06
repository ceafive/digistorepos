import axios from "axios";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import { addCustomer } from "features/cart/cartSlice";
import debounce from "lodash.debounce";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import AddCustomerModal from "./AddCustomerModal";

const AddCustomer = () => {
  const {
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);

  // console.log(currentCustomer);

  const [step, setStep] = React.useState(0);
  const [allCustomers, setAllCustomers] = React.useState([]);
  const [openAddCustomerModal, setOpenAddCustomerModal] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  const watchCustomerSearch = watch("searchCustomer", "");

  React.useEffect(() => {
    const space = new RegExp("\\s");
    const testforspace = space.test(watchCustomerSearch);

    const fetchCustomerDetails = async () => {
      try {
        setSearching(true);
        setAllCustomers([]);
        dispatch(addCustomer(null));
        const response = await axios.post("/api/sell/sell/get-customer", { phoneNumber: encodeURIComponent(watchCustomerSearch) });
        const { data } = await response.data;

        if (data) {
          if (Array.isArray(data)) {
            setAllCustomers(data);
          } else {
            setAllCustomers([data]);
          }
        } else setAllCustomers([]);
      } catch (error) {
        console.log(error);
      } finally {
        setSearching(false);
      }
    };

    if (watchCustomerSearch) {
      if (testforspace || watchCustomerSearch?.length >= 10) {
        fetchCustomerDetails();
      }
      // debounce(fetchCustomerDetails, 150, { maxWait: 50 })();
    }
  }, [watchCustomerSearch]);

  return (
    <div className="w-full">
      <Modal open={openAddCustomerModal} onClose={() => setOpenAddCustomerModal(false)} maxWidth="sm">
        <AddCustomerModal
          onClose={() => setOpenAddCustomerModal(false)}
          functionToRun={(data) => {
            dispatch(addCustomer(data));
            setStep(2);
          }}
        />
      </Modal>

      <div className="w-full">
        {!currentCustomer && step === 0 && (
          <div className="py-3 text-sm">
            <span className="mr-2">
              <i className="fas fa-user-alt"></i>
            </span>
            <button
              className="font-bold text-blue-500 focus:outline-none"
              onClick={() => {
                setStep(1);
              }}
            >
              <span>Add a customer</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="relative" initial={{ y: "-1vw" }} animate={{ y: 0 }}>
            <div>
              <span className="absolute z-10 w-8 py-3 pl-3 text-center text-blueGray-300">
                <i className="fas fa-search"></i>
              </span>
              <input
                {...register("searchCustomer")}
                type="text"
                placeholder="Search here..."
                className="relative w-full p-2 py-3 pl-10 text-sm bg-white border-0 rounded shadow outline-none appearance-none placeholder-blueGray-300 text-blueGray-600 focus:outline-none focus:ring-1"
              />

              <span
                className="absolute right-0 z-10 w-8 py-3 pr-3 text-center text-red-500 cursor-pointer"
                onClick={() => {
                  setStep(0);
                  setValue("searchCustomer", "");
                  setAllCustomers([]);
                }}
              >
                {searching ? <Spinner width={20} height={20} /> : <i className="fas fa-times-circle"></i>}
              </span>
            </div>
            <div
              className={`z-10 absolute w-full p-2 bg-white border border-gray-800 rounded shadow-lg 
           
              `}
              // ${ allCustomers.length > 0 && "overflow-x-hidden overflow-scroll" }
              style={{
                top: 50,
                // height: allCustomers.length > 0 ? 90 : "auto",
              }}
            >
              {watchCustomerSearch && (
                <>
                  {allCustomers.length > 0 ? (
                    allCustomers?.map((customer) => {
                      // console.log(customer);
                      return (
                        <div
                          className="w-full py-1 cursor-pointer"
                          key={customer.customer_id}
                          onClick={() => {
                            dispatch(addCustomer(customer));
                            setStep(2);
                            setAllCustomers([]);
                            // console.log(customer);
                          }}
                        >
                          <div className="flex items-center" key={customer.customer_id}>
                            <div className="flex items-center w-full">
                              <div className="flex items-center justify-between w-full px-1">
                                <div className="flex items-center">
                                  <span className="font-bold">{customer.customer_name}</span>
                                  <span className="ml-2 text-xs">{customer.customer_email}</span>
                                  <span className="ml-2 text-xs">{customer.customer_phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-between w-full h-full">
                      <p className="font-medium">{searching ? "Searching..." : "No customer found"}</p>
                    </div>
                  )}
                </>
              )}
              {/* {!searching && ( */}
              <div className="flex flex-col items-center justify-between w-full h-full">
                <button
                  className="text-sm text-blue-500 focus:outline-none"
                  onClick={() => {
                    setOpenAddCustomerModal(true);
                  }}
                >
                  Add New Customer
                </button>
              </div>
              {/* )} */}
            </div>
          </div>
        )}

        {(currentCustomer || step === 2) && (
          <div className="flex items-center justify-between w-full py-3 text-sm">
            <div>
              <span className="mr-2">
                <i className="fas fa-user-alt"></i>
              </span>
              <span className="font-bold">{currentCustomer?.customer_name}</span>
            </div>
            <button
              className="font-bold  focus:outline-none"
              onClick={() => {
                dispatch(addCustomer(null));
                setValue("searchCustomer", "");
                setStep(0);
                setAllCustomers([]);
              }}
            >
              <i className="text-red-500 fas fa-trash-alt"></i>
            </button>
          </div>
        )}
        <hr className="my-1" />
      </div>
    </div>
  );
};

export default AddCustomer;

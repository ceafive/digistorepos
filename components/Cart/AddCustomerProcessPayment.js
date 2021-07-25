import axios from "axios";
import Modal from "components/Modal";
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

  const watchCustomerSearch = watch("searchCustomer", "");

  React.useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.post("/api/sell/get-customer", { phoneNumber: watchCustomerSearch });
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
      }
    };

    if (watchCustomerSearch) {
      debounce(fetchCustomerDetails, 250, { maxWait: 500 })();
    }
  }, [watchCustomerSearch]);

  return (
    <div className="w-full">
      <Modal open={openAddCustomerModal} onClose={() => setOpenAddCustomerModal(false)} maxWidth="sm">
        <AddCustomerModal onClose={() => setOpenAddCustomerModal(false)} setStep={setStep} />
      </Modal>

      <div className="w-full">
        {!currentCustomer && step === 0 && (
          <div className="text-sm py-3">
            <span className="mr-2">
              <i className="fas fa-user-alt"></i>
            </span>
            <button
              className="text-blue-500 focus:outline-none font-bold"
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
              <span className="z-10 absolute text-center text-blueGray-300 w-8 pl-3 py-3">
                <i className="fas fa-search"></i>
              </span>
              <input
                {...register("searchCustomer")}
                type="number"
                placeholder="Search here..."
                className="appearance-none border-0 p-2 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring-1 w-full pl-10"
              />

              <span
                className="z-10 absolute right-0 text-center text-red-500 w-8 pr-3 py-3 cursor-pointer"
                onClick={() => {
                  setStep(0);
                  setValue("searchCustomer", "");
                  setAllCustomers([]);
                }}
              >
                <i className="fas fa-times-circle"></i>
              </span>
            </div>
            {watchCustomerSearch && (
              <div
                className={`z-10 absolute w-full p-2 bg-white border border-gray-800 rounded shadow-lg 
           
              `}
                // ${ allCustomers.length > 0 && "overflow-x-hidden overflow-scroll" }
                style={{
                  top: 50,
                  // height: allCustomers.length > 0 ? 90 : "auto",
                }}
              >
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
                            <div className="flex justify-between items-center w-full px-1">
                              <div className="flex items-center">
                                <span className="font-bold">{customer.customer_name}</span>
                                <span className="text-xs ml-2">{customer.customer_email}</span>
                                <span className="text-xs ml-2">{customer.customer_phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col justify-between items-center w-full h-full">
                    <p className="font-medium">No customer found</p>

                    <button
                      className="text-sm text-blue-500 focus:outline-none"
                      onClick={() => {
                        setOpenAddCustomerModal(true);
                      }}
                    >
                      Add New Customer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(currentCustomer || step === 2) && (
          <div className="w-full flex justify-between items-center text-sm py-3">
            <div>
              <span className="mr-2">
                <i className="fas fa-user-alt"></i>
              </span>
              <span className="font-bold">{currentCustomer?.customer_name}</span>
            </div>
            <button
              className=" focus:outline-none font-bold"
              onClick={() => {
                dispatch(addCustomer(null));
                setValue("searchCustomer", "");
                setStep(0);
                setAllCustomers([]);
              }}
            >
              <i className="fas fa-trash-alt text-red-500"></i>
            </button>
          </div>
        )}
        <hr className="my-1" />
      </div>
    </div>
  );
};

export default AddCustomer;

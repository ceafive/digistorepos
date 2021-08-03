import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { createFilter } from "react-search-input";
import { addCustomer } from "features/cart/cartSlice";
import axios from "axios";
import debounce from "lodash.debounce";
import Modal from "components/Modal";
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

  // React.useEffect(() => {
  //   const KEYS_TO_FILTERS = ["name", "username", "email"];
  //   const filteredCustomers = customers.filter(createFilter(watchCustomerSearch ?? "", KEYS_TO_FILTERS));

  //   setAllCustomers(filteredCustomers);
  // }, [customers, watchCustomerSearch]);

  React.useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.post("/api/products/get-customer", { phoneNumber: watchCustomerSearch });
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
      debounce(fetchCustomerDetails, 250, { maxWait: 1000 })();
    }
  }, [watchCustomerSearch]);

  return (
    <>
      <Modal open={openAddCustomerModal} onClose={() => setOpenAddCustomerModal(false)}>
        <AddCustomerModal onClose={() => setOpenAddCustomerModal(false)} setStep={setStep} />
      </Modal>
      <div className="w-full">
        {step === 0 && (
          <div className="text-sm py-2">
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
          <motion.div className="relative" initial={{ y: "-1vw" }} animate={{ y: 0 }}>
            <div>
              <span className="z-10 absolute text-center text-blueGray-300 w-8 pl-3 py-2">
                <i className="fas fa-search"></i>
              </span>
              <input
                {...register("searchCustomer")}
                type="text"
                placeholder="Search here..."
                className="border-0 p-2 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />

              <span
                className="z-10 absolute right-0 text-center text-red-500 w-8 pr-3 py-2 cursor-pointer"
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
                    return (
                      <div
                        className="w-full py-2 cursor-pointer"
                        key={customer.id}
                        onClick={() => {
                          dispatch(addCustomer(customer));
                          setStep(2);
                          setAllCustomers([]);
                          // console.log(customer);
                        }}
                      >
                        <div className="flex items-center" key={customer.id}>
                          <div className="flex items-center w-full">
                            <div className="flex justify-between items-center w-full px-4">
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
          </motion.div>
        )}
        {step === 2 && (
          <div className="w-full flex justify-between items-center text-sm py-2">
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
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        )}
        <hr className="my-1" />
      </div>
    </>
  );
};

export default AddCustomer;

import axios from "axios";
import Modal from "components/Modal";
import Spinner from "components/Spinner";
import { addCustomer } from "features/cart/cartSlice";
import debounce from "lodash.debounce";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

import AddCustomerModal from "./AddCustomerModal";

const AddCustomer = () => {
  const { addToast } = useToasts();
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
        //TODO: this is for Ghana number implentation
        fetchCustomerDetails();
      }
      // debounce(fetchCustomerDetails, 1000, { maxWait: 5000 })();
    }
  }, [watchCustomerSearch]);

  return (
    <div className="w-full">
      <Modal open={openAddCustomerModal} onClose={() => setOpenAddCustomerModal(false)} maxWidth="sm">
        <AddCustomerModal onClose={() => setOpenAddCustomerModal(false)} setStep={setStep} />
      </Modal>
      <div className="flex justify-between items-center w-full">
        {!currentCustomer && (
          <div className="text-sm w-6/12 mr-2">
            <button
              className="text-white focus:outline-none font-bold bg-blueGray-800 px-4 py-3 rounded w-full"
              onClick={() => {
                setStep(1);
                // setOpenAddCustomerModal(true);
              }}
            >
              Add Customer
            </button>
          </div>
        )}

        <div className={`text-sm ${currentCustomer ? "w-full" : "w-6/12"} `}>
          <button
            className="text-white focus:outline-none font-bold bg-blue-800 px-4 py-3 rounded w-full"
            onClick={() => {
              addToast(`NOT AVAILABLE`, { autoDismiss: true });
            }}
          >
            Quick Sale
          </button>
        </div>
      </div>
      <div className="w-full">
        {step === 1 && (
          <div className="relative mt-4" initial={{ y: "-1vw" }} animate={{ y: 0 }}>
            <div>
              <span className="z-10 absolute text-center text-blueGray-300 w-8 pl-3 py-3">
                <i className="fas fa-search"></i>
              </span>
              <input
                {...register("searchCustomer")}
                type="text"
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
                {searching ? <Spinner width={20} height={20} /> : <i className="fas fa-times-circle"></i>}
              </span>
            </div>
            {watchCustomerSearch && (
              <div
                className={`z-10 absolute w-full p-2 bg-white border border-gray-500 rounded shadow-3xl 
           
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
          <div className="w-full flex justify-between items-center text-sm pt-3">
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
      </div>
    </div>
  );
};

export default AddCustomer;

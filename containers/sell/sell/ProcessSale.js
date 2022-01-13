// import CashPaymentModal from "components/Cart/CashPaymentModal";
// import CollectUserDetail from "components/Cart/CollectUserDetail";
// import Modal from "components/Modal";
import CashPaymentModal from "containers/sell/sell/cart/CashPaymentModal";
import CollectUserDetail from "containers/sell/sell/cart/CollectUserDetail";
import {
  calculateCartSubTotal,
  setAmountReceivedFromPayer,
  setInvoiceDetails,
  setRewardPoints,
  setTotalAmountToBePaidByBuyer,
  setTransactionFeeCharges,
} from "features/cart/cartSlice";
import dynamic from "next/dynamic";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { useToasts } from "react-toast-notifications";
import { configureVariables, onAddPayment, onRaiseOrder, onSendNotification } from "utils";

import PrintComponent from "./PrintComponent";
import RaiseOrderSection from "./RaiseOrderSection";
import ReceiptsSection from "./ReceiptsSection";

const Modal = dynamic(() => import("components/Modal"));

const ProcessSale = ({ setReFetch }) => {
  const dispatch = useDispatch();
  const { addToast, removeToast } = useToasts();
  const componentRef = React.useRef();
  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
  } = useForm({
    mode: "all",
  });

  // Selectors
  const totalPriceInCart = useSelector((state) => state.cart.totalPriceInCart);
  const cartSubTotal = useSelector((state) => state.cart.cartSubTotal);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const paymentMethodsAndAmount = useSelector((state) => state.cart.paymentMethodsAndAmount);
  const transactionFeeCharges = useSelector((state) => state.cart.transactionFeeCharges);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);
  const paymentMethodSet = useSelector((state) => state.cart.paymentMethodSet);
  const invoiceDetails = useSelector((state) => state.cart.invoiceDetails);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);
  const cart = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products);
  const totalTaxes = useSelector((state) => state.cart.totalTaxes);
  const cartDiscountOnCartTotal = useSelector((state) => state.cart.cartDiscountOnCartTotal);
  const cartPromoDiscount = useSelector((state) => state.cart.cartPromoDiscount);

  // Variables
  const user = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));
  const lengthOfMobileNumber = 10;
  const { fees, saleTotal } = React.useMemo(
    () => configureVariables({ transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer }),
    [transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer]
  );

  // Component State
  const [step, setStep] = React.useState(0);
  const [payerAmountEntered, setPayerAmountEntered] = React.useState(saleTotal - amountReceivedFromPayer);
  const [openCashModal, setOpenCashModal] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [openPhoneNumberInputModal, setOpenPhoneNumberInputModal] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);
  const [sendingNotification, setSendingNotification] = React.useState(false);
  const [processError, setProcessError] = React.useState(false);
  const [confirmPaymentText, setConfirmPaymentText] = React.useState("");
  const [confirmButtonText, setConfirmButtonText] = React.useState("");

  // React.useEffect(() => {
  //   dispatch(setTotalAmountToBePaidByBuyer(saleTotal));
  // }, [dispatch, saleTotal]);

  React.useEffect(() => {
    setPayerAmountEntered(Number(parseFloat(amountReceivedFromPayer >= saleTotal ? 0 : saleTotal - amountReceivedFromPayer).toFixed(2)));
  }, [amountReceivedFromPayer, saleTotal]);

  React.useEffect(() => {
    dispatch(calculateCartSubTotal());
  }, [totalPriceInCart, deliveryCharge, cartDiscountOnCartTotal, cartPromoDiscount]);

  // console.log({ fetching, amountReceivedFromPayer, balance });

  const handlePayment = (values) =>
    onAddPayment(
      dispatch,
      setTransactionFeeCharges,
      setFetching,
      user,
      paymentMethodsAndAmount,
      paymentMethodSet,
      payerAmountEntered,
      cartSubTotal,
      setAmountReceivedFromPayer,
      setOpenPhoneNumberInputModal,
      reset,
      currentCustomer,
      values
    );

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => setPrinting(true),
    onAfterPrint: () => setPrinting(false),
  });

  const handleSendNotification = (type, customer = {}) =>
    onSendNotification(type, setSendingNotification, addToast, removeToast, invoiceDetails, user, customer);

  const handleRaiseOrder = () =>
    onRaiseOrder(
      dispatch,
      setInvoiceDetails,
      setConfirmPaymentText,
      setStep,
      setFetching,
      setProcessError,
      cart,
      products,
      fees,
      saleTotal,
      user,
      setRewardPoints
    );

  return (
    <>
      <Modal open={openCashModal} onClose={() => setOpenCashModal(false)} maxWidth="sm">
        <CashPaymentModal onClose={() => setOpenCashModal(false)} payerAmountEntered={payerAmountEntered} cartSubTotal={cartSubTotal} />
      </Modal>
      <Modal open={openPhoneNumberInputModal} onClose={() => setOpenPhoneNumberInputModal(false)} maxWidth="sm">
        <CollectUserDetail
          fetching={fetching}
          onAddPayment={handlePayment}
          paymentMethodSet={paymentMethodSet}
          register={register}
          handleSubmit={handleSubmit}
          lengthOfMobileNumber={lengthOfMobileNumber}
          errors={errors}
          cartSubTotal={cartSubTotal}
          onClose={() => setOpenPhoneNumberInputModal(false)}
        />
      </Modal>
      <div style={{ display: "none" }}>
        <PrintComponent ref={componentRef} />
      </div>
      <div className="flex bg-white divide-x divide-gray-200 rounded shadow">
        <div className={`${step !== 2 ? "w-2/5 xl:w-1/2" : "w-1/2 xl:w-1/2"} p-6 transition-all`}>
          <ReceiptsSection step={step} />
        </div>
        <div className={`${step !== 2 ? "w-3/5 xl:w-1/2" : "w-1/2 xl:w-1/2"} p-6 pt-0 transition-all`}>
          <RaiseOrderSection
            handleRaiseOrder={handleRaiseOrder}
            setOpenPhoneNumberInputModal={setOpenPhoneNumberInputModal}
            handlePrint={handlePrint}
            step={step}
            setStep={setStep}
            printing={printing}
            payerAmountEntered={payerAmountEntered}
            setPayerAmountEntered={setPayerAmountEntered}
            fetching={fetching}
            setFetching={setFetching}
            processError={processError}
            handleSendNotification={handleSendNotification}
            sendingNotification={sendingNotification}
            confirmPaymentText={confirmPaymentText}
            confirmButtonText={confirmButtonText}
            setConfirmButtonText={setConfirmButtonText}
            setProcessError={setProcessError}
            userDetails={user}
            setReFetch={setReFetch}
          />
        </div>
      </div>
    </>
  );
};

export default ProcessSale;

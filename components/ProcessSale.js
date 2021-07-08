import Modal from "components/Modal";
import {
  setAmountReceivedFromPayer,
  setInvoiceDetails,
  setTotalAmountToBePaidByBuyer,
  setTransactionFeeCharges,
} from "features/cart/cartSlice";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { useToasts } from "react-toast-notifications";
import { configureVariables, onAddPayment, onRaiseOrder, onSendNotification } from "utils";

import CashPaymentModal from "./Cart/CashPaymentModal";
import CollectUserDetail from "./Cart/CollectUserDetail";
import PrintComponent from "./Sell/PrintComponent";
import RaiseOrderSection from "./Sell/RaiseOrderSection";
import ReceiptsSection from "./Sell/ReceiptsSection";

const ProcessSale = () => {
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
  const cartTotalMinusDiscountPlusTax = useSelector((state) => state.cart.cartTotalMinusDiscountPlusTax);
  const amountReceivedFromPayer = useSelector((state) => state.cart.amountReceivedFromPayer);
  const paymentMethodsAndAmount = useSelector((state) => state.cart.paymentMethodsAndAmount);
  const transactionFeeCharges = useSelector((state) => state.cart.transactionFeeCharges);
  const deliveryCharge = useSelector((state) => state.cart.deliveryCharge);
  const outletSelected = useSelector((state) => state.products.outletSelected);
  const paymentMethodSet = useSelector((state) => state.cart.paymentMethodSet);
  const cart = useSelector((state) => state.cart);
  const deliveryTypes = useSelector((state) => state.cart.deliveryTypes);
  const invoiceDetails = useSelector((state) => state.cart.invoiceDetails);
  const currentCustomer = useSelector((state) => state.cart.currentCustomer);

  // console.log(cart);

  // Component State
  const [step, setStep] = React.useState(0);
  const [payerAmountEntered, setPayerAmountEntered] = React.useState(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer);
  const [openCashModal, setOpenCashModal] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [openPhoneNumberInputModal, setOpenPhoneNumberInputModal] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);
  const [sendingNotification, setSendingNotification] = React.useState(false);
  const [processError, setProcessError] = React.useState(false);
  const [confirmPaymentText, setConfirmPaymentText] = React.useState("");
  const [confirmButtonText, setConfirmButtonText] = React.useState("");

  // Variables
  const user = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));
  const lengthOfMobileNumber = 10;
  const { fees, saleTotal } = configureVariables(transactionFeeCharges, cartTotalMinusDiscountPlusTax, deliveryCharge);

  React.useEffect(() => {
    dispatch(setTotalAmountToBePaidByBuyer(saleTotal));
  }, [dispatch, saleTotal]);

  React.useEffect(() => {
    setPayerAmountEntered(
      Number(
        parseFloat(
          amountReceivedFromPayer >= cartTotalMinusDiscountPlusTax ? 0 : cartTotalMinusDiscountPlusTax - amountReceivedFromPayer
        ).toFixed(2)
      )
    );
  }, [amountReceivedFromPayer, cartTotalMinusDiscountPlusTax]);

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

  const handleSendNotification = (type) => onSendNotification(type, setSendingNotification, addToast, removeToast, invoiceDetails, user);

  const handleRaiseOrder = () =>
    onRaiseOrder(
      dispatch,
      setInvoiceDetails,
      setConfirmPaymentText,
      setStep,
      setFetching,
      setProcessError,
      cart,
      outletSelected,
      deliveryTypes,
      fees,
      saleTotal,
      currentCustomer,
      user
    );

  return (
    <>
      <Modal open={openCashModal} onClose={() => setOpenCashModal(false)} maxWidth="sm">
        <CashPaymentModal
          onClose={() => setOpenCashModal(false)}
          payerAmountEntered={payerAmountEntered}
          cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax}
        />
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
          cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax}
          onClose={() => setOpenPhoneNumberInputModal(false)}
        />
      </Modal>
      <div style={{ display: "none" }}>
        <PrintComponent ref={componentRef} />
      </div>
      <div className="flex divide-x divide-gray-200 bg-white rounded shadow">
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
          />
        </div>
      </div>
    </>
  );
};

export default ProcessSale;

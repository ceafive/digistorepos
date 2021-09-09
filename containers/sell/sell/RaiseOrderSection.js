import dynamic from "next/dynamic";
import React from "react";

import ConfirmPayment from "./ConfirmPayment";
import PaymentReceived from "./PaymentReceived";
import ProcessPayment from "./ProcessPayment";

// const ProcessPayment = dynamic(() => import("./ProcessPayment"));
// const ConfirmPayment = dynamic(() => import("./ConfirmPayment"));
// const PaymentReceived = dynamic(() => import("./PaymentReceived"));

const RaiseOrderSection = ({
  handleRaiseOrder,
  setOpenPhoneNumberInputModal,
  handlePrint,
  setStep,
  step,
  printing,
  payerAmountEntered,
  setPayerAmountEntered,
  fetching,
  setFetching,
  processError,
  handleSendNotification,
  sendingNotification,
  confirmPaymentText,
  verifyTransaction,
  confirmButtonText,
  setConfirmButtonText,
  setProcessError,
  userDetails,
  setReFetch,
}) => {
  return (
    <>
      {step === 0 && (
        <ProcessPayment
          fetching={fetching}
          handlePrint={handlePrint}
          handleRaiseOrder={handleRaiseOrder}
          handleSendNotification={handleSendNotification}
          payerAmountEntered={payerAmountEntered}
          printing={printing}
          processError={processError}
          sendingNotification={sendingNotification}
          setFetching={setFetching}
          setOpenPhoneNumberInputModal={setOpenPhoneNumberInputModal}
          setPayerAmountEntered={setPayerAmountEntered}
          setStep={setStep}
          step={step}
        />
      )}

      {step === 1 && (
        <ConfirmPayment
          setStep={setStep}
          confirmPaymentText={confirmPaymentText}
          fetching={fetching}
          verifyTransaction={verifyTransaction}
          processError={processError}
          confirmButtonText={confirmButtonText}
          setConfirmButtonText={setConfirmButtonText}
          setProcessError={setProcessError}
          userDetails={userDetails}
          setFetching={setFetching}
          setReFetch={setReFetch}
        />
      )}

      {step === 2 && (
        <PaymentReceived
          handlePrint={handlePrint}
          handleSendNotification={handleSendNotification}
          printing={printing}
          sendingNotification={sendingNotification}
          setReFetch={setReFetch}
        />
      )}
    </>
  );
};

export default RaiseOrderSection;

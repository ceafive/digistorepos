import React from "react";
import PaymentReceived from "./PaymentReceived";
import ConfirmPayment from "./ConfirmPayment";
import ProcessPayment from "./ProcessPayment";

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
        />
      )}

      {step === 2 && (
        <PaymentReceived
          handlePrint={handlePrint}
          handleSendNotification={handleSendNotification}
          printing={printing}
          sendingNotification={sendingNotification}
        />
      )}
    </>
  );
};

export default RaiseOrderSection;

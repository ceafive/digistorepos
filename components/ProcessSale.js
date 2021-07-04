import {
  setAmountReceivedFromPayer,
  setInvoiceDetails,
  setTotalAmountToBePaidByBuyer,
  setTransactionFeeCharges,
  setVerifyTransactionResponse,
} from "features/cart/cartSlice";
import { get, capitalize, reduce, replace, upperCase } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Modal from "components/Modal";
import CashPaymentModal from "./Cart/CashPaymentModal";
import axios from "axios";
import { forEach } from "p-iteration";
import CollectUserDetail from "./Cart/CollectUserDetail";
import ReceiptsSection from "./Sell/ReceiptsSection";
import RaiseOrderSection from "./Sell/RaiseOrderSection";
import PrintComponent from "./Sell/PrintComponent";
import { useToasts } from "react-toast-notifications";

import { useReactToPrint } from "react-to-print";
import { addSeconds, isAfter } from "date-fns";
import CollectCashGiveBalance from "./Cart/CollectCashGiveBalance";

const paymentOptions = [
  { name: "CASH", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-CASH.png", showInput: false },
  { name: "VISAG", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-VISAG.png", showInput: true },
  { name: "QRPAY", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-QRPAY.png", showInput: true },
  { name: "BNKTR", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-BNKTR.png", showInput: true },
  { name: "MTNMM", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-MTNMM.png", showInput: true },
  { name: "TIGOC", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-TIGOC.png", showInput: true },
  { name: "VODAC", img: " https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-VODAC.png", showInput: true },
  { name: "GCBMM", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-GCBMM.png", showInput: true },
];

const loyaltyTabs = ["Loyalty", "Layby", "Store Credit", "On Account"];

const ProcessSale = () => {
  const dispatch = useDispatch();
  const { addToast, removeAllToasts, removeToast, toastStack, updateToast } = useToasts();
  const componentRef = React.useRef();
  const {
    formState: { errors },
    register,
    watch,
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
  const fees = Number(parseFloat(reduce(transactionFeeCharges, (sum, n) => sum + Number(parseFloat(n?.charge).toFixed(3)), 0)).toFixed(3));
  const lengthOfMobileNumber = 10;
  const userDetails = JSON.parse(sessionStorage.getItem("IPAYPOSUSER"));
  const saleTotal = Number(parseFloat(cartTotalMinusDiscountPlusTax + (deliveryCharge?.price || 0) + fees).toFixed(3));

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

  const fetchFeeCharges = async (userPaymentMethods) => {
    try {
      setFetching(true);
      let user = sessionStorage.getItem("IPAYPOSUSER");
      user = JSON.parse(user);

      const feeCharges = [];

      await forEach(userPaymentMethods, async (paymentMethod) => {
        const res = await axios.post("/api/sell/get-transaction-fee-charges", {
          merchant: user["user_merchant_id"],
          channel: paymentMethod.method,
          amount: paymentMethod.amount,
        });
        const response = await res.data;

        const charge = get(response, "charge", 0);
        feeCharges.push({ ...response, charge: Number(parseFloat(charge).toFixed(3)) });
      });
      dispatch(setTransactionFeeCharges(feeCharges));
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const onAddPayment = async (values) => {
    try {
      await fetchFeeCharges([
        ...paymentMethodsAndAmount,
        {
          method: paymentMethodSet,
          amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
          payment_number: values[paymentMethodSet],
        },
      ]);
      if (paymentMethodSet === "CASH") {
        dispatch(
          setAmountReceivedFromPayer({
            method: paymentMethodSet,
            amount: Number(parseFloat(values[paymentMethodSet]).toFixed(2)),
          })
        );
        // if (payerAmountEntered === cartTotalMinusDiscountPlusTax) {
        //   dispatch(
        //     setAmountReceivedFromPayer({
        //       method: paymentMethodSet,
        //       amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
        //       payment_number: values[paymentMethodSet],
        //     })
        //   );
        // } else setOpenCashModal(true);
      } else {
        dispatch(
          setAmountReceivedFromPayer({
            method: paymentMethodSet,
            amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
            payment_number: values[paymentMethodSet],
          })
        );
      }

      setOpenPhoneNumberInputModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      reset({
        [paymentMethodSet]: "",
      });
    }
  };

  // console.log({ fetching, amountReceivedFromPayer, balance });

  const handleRaiseOrder = async () => {
    try {
      // if (paymentMethodSet === "CASH") {

      // } else setStep(1);

      // return;
      setFetching(true);
      setProcessError(false);
      const productsInCart = cart?.productsInCart;
      const productsJSON = productsInCart.reduce((acc, curr, index) => {
        const variants = Object.values(curr?.variants).map((variant, index) => {
          return `${capitalize(variant)}`;
        });

        const properties = Object.entries(curr?.variants).reduce((acc, variant, index) => {
          return { ...acc, [upperCase(variant[0])]: [variant[1]][0] };
        }, {});

        const addVariants = variants.length > 0 ? `( ${variants.join(", ")} )` : "";

        return {
          ...acc,
          [index]: {
            order_item_no: curr?.product_id,
            order_item_qty: curr?.quantity,
            order_item: `${curr?.product_name} ${addVariants}`,
            order_item_amt: curr?.totalPrice,
            order_item_prop: properties,
          },
        };
      }, {});

      // return;
      const payload = {
        order_notes: cart?.cartNote,
        order_items: JSON.stringify(productsJSON),
        order_outlet: outletSelected?.outlet_id,
        delivery_type: replace(upperCase(cart?.deliveryTypeSelected), " ", "-"),
        delivery_notes: cart?.deliveryNotes,
        delivery_id:
          cart?.deliveryTypeSelected === "Pickup"
            ? outletSelected?.outlet_id
            : deliveryTypes["option_delivery"] === "MERCHANT"
            ? "merchant_id"
            : "",
        delivery_location: cart?.deliveryLocationInputted?.label ?? "",
        delivery_gps: cart?.deliveryGPS ?? "",
        delivery_name: cart?.currentCustomer?.customer_name ?? "",
        delivery_contact: cart?.currentCustomer?.customer_phone ?? "",
        delivery_email: cart?.currentCustomer?.customer_email ?? "",
        order_discount_code: cart?.cartPromoCode ?? "",
        order_amount: cart?.totalPriceInCart ?? 0,
        order_discount: cart?.cartDiscountOnCartTotal + cart?.cartPromoDiscount,
        delivery_charge: cart?.deliveryCharge?.price ?? 0,
        service_charge: fees,
        total_amount: saleTotal,
        payment_type:
          cart?.paymentMethodSet === "CASH"
            ? "CASH"
            : cart?.paymentMethodSet === "VISAG"
            ? "CARD"
            : cart?.paymentMethodSet === "MTNMM" || cart?.paymentMethodSet === "TIGOC" || cart?.paymentMethodSet === "VODAC"
            ? "MOMO"
            : "",
        payment_number: cart?.paymentMethodsAndAmount[0]?.payment_number ?? currentCustomer?.customer_phone ?? "",
        payment_network: cart?.paymentMethodSet,
        merchant: userDetails["user_merchant_id"],
        source: "INSHP",
        notify_source: "WEB",
        mod_by: userDetails["login"],
      };

      // console.log({ cart });
      // console.log({ payload });
      // return;

      const res = await axios.post("/api/sell/raise-order", payload);
      const data = await res.data;
      // console.log(data);

      if (data?.status !== 0) {
        setProcessError(data?.message);
      }
      if (data?.status === 0 && cart?.paymentMethodSet === "CASH") {
        dispatch(setInvoiceDetails(data));
        setStep(2);
      }

      if (Number(data?.status) === 0 && cart?.paymentMethodSet !== "CASH") {
        dispatch(setInvoiceDetails(data));
        setConfirmPaymentText(data?.message);
        setStep(1);
      }
    } catch (error) {
      console.log(error.response.data);
    } finally {
      setFetching(false);
    }
  };

  const handleSendNotification = async (type = "SMS") => {
    try {
      setSendingNotification(type);
      addToast(`Sending ${type}`, { appearance: "info", id: "notif-sending" });
      const payload = {
        tran_id: invoiceDetails?.invoice,
        tran_type: "ORDER",
        notify_type: type,
        merchant: userDetails["user_merchant_id"],
        mod_by: userDetails["login"],
      };
      const res = await axios.post("/api/sell/send-notification", payload);
      const data = await res.data;
      // console.log(data);

      removeToast("notif-sending");
      if (Number(data?.status) === 0) {
        addToast(data?.message, { appearance: "success", autoDismiss: true });
      } else {
        addToast(data?.message, { appearance: "error", autoDismiss: true });
      }
    } catch (error) {
      console.log(error);
      addToast(error.message, { appearance: "error" });
    } finally {
      setSendingNotification(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => setPrinting(true),
    onAfterPrint: () => setPrinting(false),
  });

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
        {/* <CollectCashGiveBalance
          fetching={fetching}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          cartTotalMinusDiscountPlusTax={cartTotalMinusDiscountPlusTax}
          onClose={() => setOpenPhoneNumberInputModal(false)}
        /> */}

        <CollectUserDetail
          fetching={fetching}
          onAddPayment={onAddPayment}
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
            userDetails={userDetails}
          />
        </div>
      </div>
    </>
  );
};

export default ProcessSale;

import { setAmountReceivedFromPayer, setTotalAmountToBePaidByBuyer, setTransactionFeeCharges } from "features/cart/cartSlice";
import { get, intersectionWith, isEqual, reduce, replace, upperCase } from "lodash";
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

import ReactToPrint, { useReactToPrint } from "react-to-print";

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

  console.log(cart);

  // Component State
  const [step, setStep] = React.useState(0);
  const [payerAmountEntered, setPayerAmountEntered] = React.useState(cartTotalMinusDiscountPlusTax - amountReceivedFromPayer);
  const [openCashModal, setOpenCashModal] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [openPhoneNumberInputModal, setOpenPhoneNumberInputModal] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);

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
        const res = await axios.post("/api/products/get-transaction-fee-charges", {
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
        if (payerAmountEntered === cartTotalMinusDiscountPlusTax) {
          dispatch(
            setAmountReceivedFromPayer({
              method: paymentMethodSet,
              amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
              payment_number: values[paymentMethodSet],
            })
          );
        } else setOpenCashModal(true);
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
      if (paymentMethodSet === "CASH") {
        setStep(2);
      } else setStep(1);

      return;
      const payload = {
        order_notes: cart?.cartNote,
        order_items: "",
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
        order_discount_code: cart?.cartPromoCode,
        order_amount: cart?.totalPriceInCart,
        order_discount: cart?.cartDiscountOnCartTotal + cart?.cartPromoDiscount,
        delivery_charge: cart?.deliveryCharge?.price ?? "",
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
        payment_number: cart?.paymentMethodsAndAmount[0]?.payment_number ?? "",
        payment_network: cart?.paymentMethodSet,
        merchant: userDetails["user_merchant_id"],
        source: "INSHP",
        notify_source: "WEB",
        mod_by: userDetails["login"],
      };

      console.log({ payload });

      const res = await axios.post("/api/products/raise-order", payload);
      const { data } = await res.data;

      console.log(res);
      console.log(data);
    } catch (error) {
      console.log(error.response.data);
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
        <CollectUserDetail
          fetching={fetching}
          onAddPayment={onAddPayment}
          paymentMethodSet={paymentMethodSet}
          register={register}
          handleSubmit={handleSubmit}
          lengthOfMobileNumber={lengthOfMobileNumber}
          errors={errors}
          onClose={() => setOpenPhoneNumberInputModal(false)}
        />
      </Modal>
      <div style={{ display: "none" }}>
        <PrintComponent ref={componentRef} />
      </div>
      <div className="flex divide-x divide-gray-200 bg-white rounded shadow">
        <div className={`${step === 0 ? "w-2/5" : "w-3/5"} p-6 transition-all`}>
          <ReceiptsSection />
        </div>
        <div className={`${step === 0 ? "w-3/5" : "w-2/5"} p-6 pt-0 transition-all`}>
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
          />
        </div>
      </div>
    </>
  );
};

export default ProcessSale;

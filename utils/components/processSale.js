import axios from "axios";
import { capitalize, get, has, reduce, replace, upperCase } from "lodash";

const configureVariables = ({ transactionFeeCharges, cartSubTotal, totalTaxes, amountReceivedFromPayer }) => {
  const fees = Number(parseFloat(reduce(transactionFeeCharges, (sum, n) => sum + Number(parseFloat(n?.charge).toFixed(3)), 0)).toFixed(3));
  const covidTax = Number(parseFloat(totalTaxes * cartSubTotal).toFixed(2));
  const saleTotal = Number(parseFloat(cartSubTotal + covidTax).toFixed(3));
  const grandTotal = Number(parseFloat(cartSubTotal + fees + covidTax).toFixed(3));
  const change = Number(parseFloat(saleTotal - amountReceivedFromPayer).toFixed(3));

  return {
    fees,
    saleTotal,
    covidTax,
    change,
    grandTotal,
  };
};

const fetchFeeCharges = async (dispatch, setTransactionFeeCharges, setFetching, user, userPaymentMethods) => {
  try {
    setFetching(true);
    const feeCharges = [];

    for (let paymentMethod of userPaymentMethods) {
      const res = await axios.post("/api/sell/sell/get-transaction-fee-charges", {
        merchant: user["user_merchant_id"],
        channel: paymentMethod.method,
        amount: paymentMethod.amount,
      });
      const response = await res.data;
      // console.log(response);

      const charge = get(response, "charge", 0);
      feeCharges.push({ ...response, charge: Number(parseFloat(charge).toFixed(3)) });
    }

    dispatch(setTransactionFeeCharges(feeCharges));
  } catch (error) {
    console.log(error);
  } finally {
    setFetching(false);
  }
};

const onAddPayment = async function (
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
) {
  // console.log(paymentMethodsAndAmount, paymentMethodSet, payerAmountEntered, cartSubTotal, currentCustomer, values);
  // return;
  try {
    await fetchFeeCharges(dispatch, setTransactionFeeCharges, setFetching, user, [
      ...paymentMethodsAndAmount,
      {
        method: paymentMethodSet,
        amount: Number(parseFloat(payerAmountEntered).toFixed(2)),
      },
    ]);

    if (paymentMethodSet === "CASH") {
      dispatch(
        setAmountReceivedFromPayer({
          method: paymentMethodSet,
          amount: Number(parseFloat(values[paymentMethodSet]).toFixed(2)),
          payment_number: currentCustomer?.customer_phone ?? "",
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

const onSendNotification = async (type = "SMS", setSendingNotification, addToast, removeToast, invoiceDetails, user, customer) => {
  try {
    setSendingNotification(type);
    addToast(`Sending ${type}`, { appearance: "info", id: "notif-sending" });
    const payload = {
      customer_email: customer?.email || "",
      customer_phone: customer?.phoneNumber || "",
      tran_id: invoiceDetails?.invoice,
      tran_type: "ORDER",
      notify_type: type,
      merchant: user["user_merchant_id"],
      mod_by: user["login"],
    };
    const res = await axios.post("/api/sell/sell/send-notification", payload);
    const data = await res.data;
    // console.log(data);

    removeToast("notif-sending");
    if (Number(data?.status) === 0) {
      addToast(data?.message, { appearance: "success", autoDismiss: true });
      return true;
    } else {
      addToast(data?.message, { appearance: "error", autoDismiss: true });
      return false;
    }
  } catch (error) {
    console.log(error);
    addToast(error.message, { appearance: "error" });
    return false;
  } finally {
    setSendingNotification(false);
  }
};

const onRaiseOrder = async (
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
) => {
  try {
    setFetching(true);
    setProcessError(false);
    const productsInCart = cart?.productsInCart;
    const productsJSON = productsInCart.reduce((acc, curr, index) => {
      const variants = Object.values(curr?.variants).map((variant) => {
        return `${capitalize(variant)}`;
      });

      const properties = Object.entries(curr?.variants).reduce((acc, variant, index) => {
        return { ...acc, [upperCase(variant[0])]: [variant[1]][0] };
      }, {});

      const typeIsNormal = has(properties, "TYPE");
      const addVariants = variants.length > 0 ? `( ${variants.join(", ")} )` : "";

      return {
        ...acc,
        [index]: {
          order_item_no: curr?.type === "quicksale" ? "" : curr?.product_id,
          order_item_qty: curr?.quantity,
          order_item: `${curr?.product_name}${!typeIsNormal ? addVariants : ""}`,
          order_item_amt: curr?.totalPrice,
          order_item_prop: !typeIsNormal ? properties : {},
          order_item_prop_id: curr?.variantID || "",
        },
      };
    }, {});

    const payload = {
      order_notes: cart?.cartNote,
      // order_items: productsJSON,
      order_items: JSON.stringify(productsJSON),
      order_outlet: cart?.outletSelected?.outlet_id ?? "",
      delivery_type: replace(upperCase(cart?.deliveryTypeSelected), " ", "-"),
      delivery_notes: cart?.deliveryNotes,
      delivery_id:
        cart?.deliveryTypeSelected === "Pickup" || cart?.deliveryTypeSelected === "Walk In" || cart?.deliveryTypeSelected === "Dine In"
          ? cart?.outletSelected?.outlet_id ?? ""
          : cart?.deliveryTypes["option_delivery"] === "MERCHANT" || cart?.deliveryTypes["option_delivery"] === "MERCHANT-DIST"
          ? cart?.deliveryCharge?.delivery_code ?? ""
          : cart?.outletSelected?.outlet_id ?? "",
      delivery_location: cart?.deliveryLocationInputted?.label ?? "",
      delivery_gps: cart?.deliveryGPS ?? "",
      delivery_name: cart?.currentCustomer?.customer_name ?? "",
      delivery_contact: cart?.currentCustomer?.customer_phone ?? "",
      delivery_email: cart?.currentCustomer?.customer_email ?? "",
      order_discount_code: cart?.cartPromoCode ?? "",
      order_amount: cart?.totalPriceInCart ?? 0,
      order_discount: cart?.cartDiscountOnCartTotal + cart?.cartPromoDiscount,
      order_discount_type: cart?.promoType,
      delivery_charge: cart?.deliveryCharge?.price ?? 0,
      delivery_charge_type: cart?.deliveryCharge?.pricingtype || "",
      delivery_charge_ref: cart?.deliveryCharge?.estimateId || "",
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
      payment_number: cart?.paymentMethodsAndAmount[0]?.payment_number ?? cart?.currentCustomer?.customer_phone ?? "",
      payment_network: cart?.paymentMethodSet,
      merchant: user["user_merchant_id"],
      source: "INSHP",
      notify_source: "WEB",
      mod_by: user["login"],
    };

    // setFetching(false);
    // console.log({ cart });
    // console.log({ payload });
    // return;

    const res = await axios.post("/api/sell/sell/raise-order", payload);
    const data = await res.data;
    console.log(data);

    if (Number(data?.status) !== 0) {
      setProcessError(data?.message);
      setFetching(false);
    }

    if (Number(data?.status) === 0) {
      if (cart?.paymentMethodSet === "CASH") {
        dispatch(setInvoiceDetails(data));
        dispatch(
          setRewardPoints({
            reward_message: data?.reward_message,
            reward_points_earned: data?.reward_points_earned,
            reward_total_points: data?.reward_total_points,
          })
        );
        setStep(2);
        setFetching(false);
      }

      if (cart?.paymentMethodSet !== "CASH") {
        dispatch(setInvoiceDetails(data));
        setConfirmPaymentText(data?.message);
        setStep(1);
        setFetching(false);
      }
    }
  } catch (error) {
    console.log(error);
    setFetching(false);
  } finally {
    setFetching(false);
  }
};

export { configureVariables, fetchFeeCharges, onAddPayment, onRaiseOrder, onSendNotification };

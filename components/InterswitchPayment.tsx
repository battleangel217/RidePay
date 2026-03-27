"use client";

import { verifyPayment } from "@/lib/api/transactions";
import { useUIStore } from "@/lib/store/uiStore";
import type { TopUpResponse } from "@/lib/types";
import React from "react";
import { InterswitchPay } from "react-interswitch";

interface InterswitchPaymentProps {
  paymentData: TopUpResponse;
  onPaymentComplete: (response: any) => void;
  onPaymentError?: (error: any) => void;
}

export const InterswitchPayment: React.FC<InterswitchPaymentProps> = ({
  paymentData,
  onPaymentComplete,
  onPaymentError,
}) => {
  const { addToast } = useUIStore();

  const handlePaymentCallback = async (response: any) => {
    console.log("Interswitch Payment Response:", response);

    // Check if payment was successful on the client side
    // resp: "00" = Approved, "01" = Pending
    if (response?.resp === "00") {
      addToast("info", "Payment processing. Please wait for confirmation...");

      try {
        // Verify payment with backend - Server-side verification is crucial
        const verificationResponse = await verifyPayment(
          paymentData.transaction_ref,
          response?.retRef || response?.payRef || response?.txnref,
          paymentData.amount,
        );

        if (verificationResponse.data?.status === "success") {
          addToast("success", "Payment successful! Wallet updated.");
          onPaymentComplete(verificationResponse.data);
        } else {
          addToast(
            "error",
            verificationResponse.data?.message ||
              "Payment verification failed. Please contact support.",
          );
          onPaymentError?.(verificationResponse.data);
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to verify payment. Please check your transaction status.";
        addToast("error", errorMsg);
        onPaymentError?.(error);
      }
    } else {
      // Payment failed on Interswitch side
      const errorMessage =
        response?.desc || "Payment was declined. Please try again.";
      console.error("Payment declined:", response);
      addToast("error", errorMessage);
      onPaymentError?.(response);
    }
  };

  const paymentParameters = {
    merchantCode: "MX187",
    payItemID: "Default_Payable_MX187",
    customerEmail: paymentData.customer_email || "customer@ridepay.com",
    customerName: paymentData.customer_name || "Customer",
    customerID: paymentData.customer_id,
    amount: String(paymentData.amount), // Must be a string in kobo
    transactionReference: paymentData.transaction_ref,
    redirectURL: "/passenger/fund",
    text: "Pay Now",
    mode: String(process.env.NEXT_PUBLIC_INTERSWITCH_MODE || "TEST"),
    callback: handlePaymentCallback,
    style: {
      width: "100%",
      height: "50px",
      border: "none",
      color: "#fff",
      backgroundColor: "#2563eb",
      fontSize: "16px",
      fontWeight: "600",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };

  return (
    <div className="w-full">
      <InterswitchPay {...paymentParameters} />
    </div>
  );
};

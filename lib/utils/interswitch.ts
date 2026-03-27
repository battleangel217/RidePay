/**
 * Generate Interswitch Webpay redirect URL for payment
 * This uses the redirect approach instead of inline payment form
 */

import type { TopUpResponse } from "../types";

export interface InterswitchPaymentURLParams {
  paymentData: TopUpResponse;
  callbackURL: string;
  merchantCode: string;
  payItemID: string;
  mode: "TEST" | "LIVE";
}

/**
 * Generate the Interswitch Webpay redirect URL
 * Users will be redirected to Interswitch payment page, then back to callback URL
 */
export function generateInterswitchPaymentURL({
  paymentData,
  callbackURL,
  merchantCode,
  payItemID,
  mode,
}: InterswitchPaymentURLParams): string {
  const baseURL =
    mode === "LIVE"
      ? "https://webpay.interswitchng.com/collections/pay"
      : "https://qa.interswitchng.com/collections/pay";

  const params = new URLSearchParams({
    merchant_code: merchantCode,
    pay_item_id: payItemID,
    amount: paymentData.amount.toString(), // in kobo
    transaction_ref: paymentData.transaction_ref,
    currency: "566", // NGN currency code
    cust_id: paymentData.customer_id,
    cust_name: paymentData.customer_name,
    cust_email: paymentData.customer_email,
    redirect_url: callbackURL,
  });

  return `${baseURL}?${params.toString()}`;
}

/**
 * Open Interswitch payment in a new tab
 */
export function openInterswitchPayment(
  url: string,
  windowName: string = "interswitch_payment",
): void {
  window.open(url, windowName, "width=800,height=600");
}

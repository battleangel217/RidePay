"use client";

import { RouteGuard } from "@/components/RouteGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { Spinner } from "@/components/ui/Spinner";
import { verifyPayment } from "@/lib/api/transactions";
import { useUIStore } from "@/lib/store/uiStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentStatus = "loading" | "success" | "error" | "idle";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPaymentFromCallback = async () => {
      setStatus("loading");

      try {
        // Extract payment details from URL parameters
        const transactionRef = searchParams.get("transaction_ref");
        const interswitchRef = searchParams.get("payRef");
        const respCode = searchParams.get("resp");
        const amount = searchParams.get("amount");

        console.log("Payment Callback Params:", {
          transactionRef,
          interswitchRef,
          respCode,
          amount,
        });

        if (!transactionRef || !interswitchRef || !amount) {
          throw new Error("Missing required payment parameters");
        }

        // Check Interswitch response code
        if (respCode !== "00" && respCode !== "01") {
          setStatus("error");
          setMessage(
            "Payment was not completed. Please try again or contact support.",
          );
          addToast("error", "Payment status: " + (respCode || "Unknown error"));
          return;
        }

        // Verify with backend
        const response = await verifyPayment(
          transactionRef,
          interswitchRef,
          parseInt(amount),
        );

        if (response.data?.status === "success") {
          setStatus("success");
          setMessage(
            "Payment verified successfully! Your wallet has been credited.",
          );
          addToast("success", "Payment successful! Wallet updated.");

          // Redirect after 3 seconds
          setTimeout(() => {
            router.push("/passenger/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            response.data?.message ||
              "Payment verification failed. Please contact support.",
          );
          addToast("error", "Payment verification failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Payment callback error:", error);
        setStatus("error");
        setMessage(
          error?.message ||
            "An error occurred while verifying your payment. Please contact support.",
        );
        addToast(
          "error",
          "Error verifying payment. Please check your transaction history.",
        );
      }
    };

    verifyPaymentFromCallback();
  }, [searchParams, router, addToast]);

  return (
    <>
      <SidebarNav />
      <div className="min-h-screen md:ml-64 md:max-w-4xl md:mx-auto pb-24 md:pb-12 px-5 md:px-8">
        <div className="pt-14 pb-6 md:pt-8">
          <h1 className="text-xl font-bold text-app-primary md:text-2xl">
            Payment Verification
          </h1>
        </div>

        <div className="flex flex-col gap-6 mt-12">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-app-primary font-medium">
                Verifying your payment...
              </p>
              <p className="text-sm text-app-secondary text-center">
                Please wait while we confirm your transaction with Interswitch.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-app-primary">
                Payment Successful
              </p>
              <p className="text-sm text-app-secondary text-center">
                {message}
              </p>
              <p className="text-xs text-app-secondary text-center">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-app-primary">
                Payment Verification Failed
              </p>
              <p className="text-sm text-app-secondary text-center">
                {message}
              </p>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => router.push("/passenger/fund")}
                  variant="secondary"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/passenger/dashboard")}
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PaymentCallbackPage() {
  return (
    <RouteGuard allowedRoles={["passenger"]}>
      <Suspense
        fallback={
          <div className="min-h-screen md:ml-64 pb-24 md:pb-12 px-5 md:px-8 flex items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <PaymentCallbackContent />
      </Suspense>
      <BottomNav />
    </RouteGuard>
  );
}

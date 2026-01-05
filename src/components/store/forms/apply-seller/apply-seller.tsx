"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StoreType } from "@/lib/types";
import {
  SubscriptionPlanTier,
  isValidSubscriptionTier,
} from "@/constants/subscription-plans";
import Instructions from "./instructions";
import ProgressBar from "./progress-bar";
import Step1 from "./steps/step-1/step-1";
import Step2 from "./steps/setp-2/step-2";
import Step3 from "./steps/setp-3/step-3";
import Step4 from "./steps/step-4/step-4";

export default function ApplySellerMultiForm() {
  const [step, setStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanTier | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (selectedPlan) return;
    const planParam = searchParams.get("plan");
    if (!planParam) return;
    const normalizedPlan = planParam.toUpperCase();

    if (isValidSubscriptionTier(normalizedPlan)) {
      setSelectedPlan(normalizedPlan as SubscriptionPlanTier);
    }
  }, [searchParams, selectedPlan]);

  const [formData, setFormData] = useState<StoreType>({
    name: "",
    description: "",
    email: "",
    phone: "",
    url: "",
    logo: "",
    cover: "",
    defaultShippingService: "",
    defaultShippingFeePerItem: undefined,
    defaultShippingFeeForAdditionalItem: undefined,
    defaultShippingFeePerKg: undefined,
    defaultShippingFeeFixed: undefined,
    defaultDeliveryTimeMin: undefined,
    defaultDeliveryTimeMax: undefined,
    returnPolicy: "",
  });
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] min-h-[calc(100vh-64px)]">
      <div className="flex-shrink-0">
        <Instructions />
      </div>
      <div className="relative p-3 md:p-5 w-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <ProgressBar step={step} />
        </div>
        <div className="flex-1">
        {/* Steps */}
        {step === 1 ? (
          <Step1
            step={step}
            setStep={setStep}
            selectedPlan={selectedPlan}
            onPlanSelect={setSelectedPlan}
          />
        ) : step === 2 ? (
          <Step2
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
          />
        ) : step === 3 ? (
          <Step3
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
          />
        ) : step === 4 ? (
          <Step4 selectedPlan={selectedPlan} formData={formData} />
        ) : null}
        </div>
      </div>
    </div>
  );
}

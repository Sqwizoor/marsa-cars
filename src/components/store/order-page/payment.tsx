"use client";

import { FC } from "react";
import StripeWrapper from "../cards/payment/stripe/stripe-wrapper";
import StripePayment from "../cards/payment/stripe/stripe-payment";

interface Props {
  orderId: string;
  amount: number;
}

const OrderPayment: FC<Props> = ({ amount, orderId }) => {
  return (
    <div className="h-full flex flex-col space-y-5">
      {/* Stripe */}
      <StripeWrapper amount={amount}>
        <StripePayment orderId={orderId} />
      </StripeWrapper>
    </div>
  );
};

export default OrderPayment;

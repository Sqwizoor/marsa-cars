export type PayFastMode = "live" | "sandbox";

// Minimal fields for PayFast redirect
export interface PayFastPaymentRequest {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  // Transaction data
  m_payment_id: string; // your order id
  amount: string; // decimal string with 2 dp
  item_name: string;
  item_description?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: number;
  custom_int2?: number;
  email_confirmation?: "0" | "1" | 0 | 1; // Can be string or number, but string preferred
  confirmation_address?: string;
  payment_method?: string; // optional
  signature?: string; // appended after signing
}

export interface PayFastITN {
  // PayFast posts many fields; we model common ones and keep index signature
  m_payment_id: string; // your order id
  pf_payment_id: string; // PayFast id
  payment_status: "COMPLETE" | "FAILED" | string;
  amount_gross: string;
  amount_fee?: string;
  amount_net?: string;
  item_name?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  signature: string;
  [key: string]: any;
}

export interface PayFastConfig {
  mode: PayFastMode;
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

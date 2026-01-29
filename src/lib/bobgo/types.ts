export interface BobGoRate {
  service_level_id: number;
  service_level_name: string;
  courier_id: number;
  courier_name: string;
  total_charge: number;
  tax_amount: number;
  currency: string;
  delivery_time_min: number;
  delivery_time_max: number;
}

export interface BobGoRateRequest {
  collection_address: {
    street_address: string;
    local_area: string;
    city: string;
    zone: string;
    country: string;
    code: string;
    lat: number;
    lng: number;
  };
  delivery_address: {
    street_address: string;
    local_area: string;
    city: string;
    zone: string;
    country: string; // ISO code e.g., 'ZA'
    code: string; // postal code
    lat?: number;
    lng?: number;
  };
  parcels: {
    submitted_length_cm: number;
    submitted_width_cm: number;
    submitted_height_cm: number;
    submitted_weight_kg: number;
  }[];
}

export interface BobGoOrder {
  order_number: string;
  payment_status: 'paid' | 'unpaid';
  collection_address: BobGoRateRequest['collection_address'];
  delivery_address: BobGoRateRequest['delivery_address'];
  parcels: BobGoRateRequest['parcels'];
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    weight: number;
  }[];
}

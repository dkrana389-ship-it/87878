export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  model_number: string;
  serial_number: string;
  purchase_date: string; // YYYY-MM-DD
  warranty_start: string;
  warranty_months: number;
  warranty_expiry: string;
  guarantee_months: number;
  guarantee_expiry: string | null;
  store_name: string;
  store_address: string;
  store_phone: string;
  amount: number;
  notes: string;
  photo_uri: string | null; // saved on the phone
  bill_uri: string | null;  // saved on the phone
  bill_name: string | null;
  created_at: string;
  updated_at: string;
};

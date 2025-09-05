export type Container = {
  id?: string;
  location: string;
  available_date: string; // ISO date string
  price: number;           // ADD this
  is_available?: boolean;  // make optional, default to true
  created_at?: string;
};

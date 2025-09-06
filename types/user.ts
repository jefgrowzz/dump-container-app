export type User = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive";
  last_active?: string;
  created_at?: string;
  updated_at?: string;
  
  // Additional fields for display
  avatar_url?: string;
  phone?: string;
  address?: string;
};

export type UserCreateRequest = {
  email: string;
  password: string;
  name?: string;
  role?: "admin" | "user" | "moderator";
  phone?: string;
  address?: string;
};

export type UserUpdateRequest = {
  name?: string;
  email?: string;
  role?: "admin" | "user" | "moderator";
  status?: "active" | "inactive";
  phone?: string;
  address?: string;
};

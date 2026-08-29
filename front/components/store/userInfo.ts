"use client";

import { create } from "zustand";

export interface User {
  email: string;
  setEmail: (email: string) => void;
}

export const userInfo = create<User>((set, _get) => ({
  email: "",
  setEmail: (email) => set({ email }),
}));

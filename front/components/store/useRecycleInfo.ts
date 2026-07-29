"use client";

import { create } from "zustand";

export interface RecycleInfo {
  productName: string;
  materilas: string[];
  description: string;
  orderDate: string;
  directInput: boolean;
}

interface Recycles {
  recycles: RecycleInfo[];
}

export const useRecycleInfo = create<Recycles>((_set, _get) => ({
  recycles: [],
}));

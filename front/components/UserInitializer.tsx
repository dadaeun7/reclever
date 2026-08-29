"use client";

import { useEffect } from "react";
import { userInfo } from "./store/userInfo";

export default function UserInitializer({ email }: { email: string }) {
  const setEmail = userInfo((state) => state.setEmail);

  useEffect(() => {
    if (email) {
      setEmail(email);
    }
  }, [email, setEmail]);

  return null;
}

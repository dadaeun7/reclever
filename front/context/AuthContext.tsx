'use client';

import { createContext, useContext } from "react";

const AuthContext = createContext({ isLoggedIn: false });

export const AuthProvider = ({isLoggedIn, children}:{isLoggedIn:boolean, children: React.ReactNode})=>(
    <AuthContext.Provider value={{ isLoggedIn }}>{children}</AuthContext.Provider>
)

export const useAuth = () => useContext(AuthContext);
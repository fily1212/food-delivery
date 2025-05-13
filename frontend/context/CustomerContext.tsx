"use client";

import React, { createContext, useContext, useState } from "react";

interface CustomerContextValue {
    customerId: number;
    setCustomerId: (id: number) => void;
}

const CustomerContext = createContext<CustomerContextValue | undefined>(
    undefined
);

export const CustomerProvider = ({
                                     children,
                                 }: {
    children: React.ReactNode;
}) => {
    const [customerId, setCustomerId] = useState<number>(1);

    return (
        <CustomerContext.Provider value={{ customerId, setCustomerId }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => {
    const ctx = useContext(CustomerContext);
    if (!ctx)
        throw new Error("useCustomer deve essere usato dentro <CustomerProvider>");
    return ctx;
};
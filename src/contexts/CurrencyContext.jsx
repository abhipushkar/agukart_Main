'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

// Context Provider Component
export default function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState({
    country: "United States",
    symbol: "$",
    code: "USD",
    rate: 1,
  });

  // Load currency from localStorage
  useEffect(() => {
    const storedCurrency = localStorage.getItem("currency");
    if (storedCurrency) {
      setCurrency(JSON.parse(storedCurrency));
    }
  }, []);

  const updateCurrency = (country, symbol, code, rate) => {
    setCurrency({ country, symbol, code, rate });
  };

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem("currency", JSON.stringify(currency));
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

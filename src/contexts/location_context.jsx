"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAPI } from "utils/__api__/ApiServies";

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState({
    countryName: "",
    countryCode: "",
  });
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Function to fetch all countries
  const fetchAllCountries = async () => {
    if (countries.length > 0) return countries;

    setIsLoadingCountries(true);
    try {
      const response = await getAPI("get-country");
      if (response.status === 200) {
        const countryList = response?.data?.contryList || [];
        setCountries(countryList);
        return countryList;
      }
      throw new Error("Failed to fetch countries");
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      return [];
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Function to detect location from IP using the new API
  const detectLocationFromIP = async () => {
    try {
      const response = await fetch("/api/current-country");
      if (response.ok) {
        const data = await response.json();
        return {
          countryName: data.countryName || "United States",
          countryCode: data.countryCode || "US",
        };
      }
      throw new Error("Failed to detect location");
    } catch (error) {
      console.error("Location detection failed:", error);
      return {
        countryName: "United States",
        countryCode: "US",
      };
    }
  };

  // Initialize location on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Check if location exists in localStorage
        const savedLocation = localStorage.getItem("userLocation");

        if (savedLocation) {
          const parsedLocation = JSON.parse(savedLocation);
          setLocationState(parsedLocation);
        } else {
          // Auto-detect from IP if no saved location
          const detectedLocation = await detectLocationFromIP();
          setLocationState(detectedLocation);
          localStorage.setItem(
            "userLocation",
            JSON.stringify(detectedLocation),
          );
        }
      } catch (error) {
        console.error("Error initializing location:", error);
        // Fallback to default
        const defaultLocation = {
          countryName: "United States",
          countryCode: "US",
        };
        setLocationState(defaultLocation);
        localStorage.setItem("userLocation", JSON.stringify(defaultLocation));
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocation();
    fetchAllCountries(); // Pre-fetch countries
  }, []);

  // Function to manually update location
  const setLocation = (newLocation) => {
    setLocationState(newLocation);
    localStorage.setItem("userLocation", JSON.stringify(newLocation));
  };

  const value = {
    location,
    setLocation,
    countries,
    fetchAllCountries,
    isLoading,
    isLoadingCountries,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

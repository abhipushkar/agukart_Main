import axios from 'axios';

const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

export const fetchConversionRate = async (baseCurrency, targetCurrency) => {
  try {
    const response = await axios.get(`${API_URL}${baseCurrency}`);
    console.log(response.data.rates,"rfgthrtjhr");
    return response.data.rates[targetCurrency];
  } catch (error) {
    console.error('Error fetching conversion rate:', error);
    return 1; // Fallback to default rate
  }
};

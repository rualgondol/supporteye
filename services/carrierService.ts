
import { CARRIERS } from '../constants';

export const detectCarrier = (phone: string) => {
  // Simple prefix-based detection for Canadian NPA codes
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) return null;
  
  const areaCode = cleanPhone.slice(cleanPhone.length - 10, cleanPhone.length - 7);
  
  const carrier = CARRIERS.find(c => c.prefixes.includes(areaCode));
  return carrier || { name: 'Generic Canada', gateway: 'txt.bell.ca' }; // Fallback to common gateway
};

export const formatCanadianPhone = (value: string) => {
  const phone = value.replace(/\D/g, '');
  if (phone.length <= 3) return phone;
  if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
};

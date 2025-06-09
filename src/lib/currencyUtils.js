import React from 'react';

export const CURRENCY_CODE = 'XOF';
export const CURRENCY_LOCALE = 'fr-FR';

export const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return String(value); 
  }
  return value.toLocaleString(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  });
};
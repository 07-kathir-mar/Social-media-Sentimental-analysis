import { createContext, useContext, useState } from 'react';

const BrandContext = createContext();

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState('Nike');

  return (
    <BrandContext.Provider value={{ brand, setBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}

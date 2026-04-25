import { createContext, useContext } from 'react';

const BrandContext = createContext();

export function BrandProvider({ children }) {
  const brand = 'Nike';
  const setBrand = () => {};

  return (
    <BrandContext.Provider value={{ brand, setBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const KitchenContext = createContext();

export const KitchenProvider = ({ children }) => {
  const [selectedKitchen, setSelectedKitchen] = useState(
    localStorage.getItem('selectedKitchen') || 'Kitchen 1'
  );

  // Sync with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedKitchen', selectedKitchen);
  }, [selectedKitchen]);

  return (
    <KitchenContext.Provider value={{ selectedKitchen, setSelectedKitchen }}>
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};

import React, { createContext, useContext, useState } from 'react';

interface ApiKeyContextProps {
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextProps>({
  openaiApiKey: '',
  setOpenaiApiKey: () => {},
});

export const useApiKeyContext = () => useContext(ApiKeyContext);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');

  return (
    <ApiKeyContext.Provider
      value={{
        openaiApiKey,
        setOpenaiApiKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};
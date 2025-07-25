import { createContext, useContext } from "react";

type EnvContextType = {
  embedAppId: string;
  apiKey: string;
  blockAppId: string;
  shopSettings: any; // TODO: will need to properly update!
};

export const EnvContext = createContext<EnvContextType | null>(null);

export const useEnv = () => {
  const context = useContext(EnvContext);
  if (!context)
    throw new Error("useEnv must be used within EnvContext.Provider");
  return context;
};

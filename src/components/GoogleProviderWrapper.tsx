
import React, { ReactNode } from 'react';
import { GoogleIntegrationProvider } from '../contexts/GoogleIntegrationContext';

interface GoogleProviderWrapperProps {
  children: ReactNode;
}

const GoogleProviderWrapper: React.FC<GoogleProviderWrapperProps> = ({ children }) => {
  return (
    <GoogleIntegrationProvider>
      {children}
    </GoogleIntegrationProvider>
  );
};

export default GoogleProviderWrapper;

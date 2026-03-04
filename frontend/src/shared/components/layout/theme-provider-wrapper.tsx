import React from 'react';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  return <>{children}</>;
}

export default ThemeProviderWrapper;

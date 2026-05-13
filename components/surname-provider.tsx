'use client';

import { createContext, useContext } from 'react';

const SurnameContext = createContext<string>('刘');

export function useSurname() {
  return useContext(SurnameContext);
}

export function SurnameProvider({
  surname,
  children,
}: {
  surname: string;
  children: React.ReactNode;
}) {
  return (
    <SurnameContext.Provider value={surname || '刘'}>
      {children}
    </SurnameContext.Provider>
  );
}

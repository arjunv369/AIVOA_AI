import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppSelector } from '../../store/hooks';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { isSidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Sidebar />

      {/* Main Content Area offset by Sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-[230px]' : 'lg:pl-[68px]'
        }`}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

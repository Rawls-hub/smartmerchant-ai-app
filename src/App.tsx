/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MerchantProvider, useMerchant } from './context/MerchantContext';
import { NearProvider } from './context/NearContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SalesView } from './components/SalesView';
import { InventoryView } from './components/InventoryView';
import { OrdersView } from './components/OrdersView';
import { PaymentsView } from './components/PaymentsView';
import { CustomersView } from './components/CustomersView';
import { ExpensesView } from './components/ExpensesView';
import { AIAssistantView } from './components/AIAssistantView';

// Modals
import { NewSaleModal } from './components/modals/NewSaleModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { WhatsAppReminderModal } from './components/modals/WhatsAppReminderModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { RestockModal } from './components/modals/RestockModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { CustomerDetailModal } from './components/modals/CustomerDetailModal';
import { DeleteCustomerConfirmModal } from './components/modals/DeleteCustomerConfirmModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { DeleteExpenseConfirmModal } from './components/modals/DeleteExpenseConfirmModal';
import { AnchorAuditModal } from './components/near/AnchorAuditModal';
import { AuditVerificationDrawer } from './components/near/AuditVerificationDrawer';

const AppContent: React.FC = () => {
  const { activeSection } = useMerchant();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'sales':
        return <SalesView />;
      case 'inventory':
        return <InventoryView />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'payments':
        return <PaymentsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'ai':
      case 'ask_ai':
        return <AIAssistantView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070B16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header onToggleMobile={() => setIsOpenMobile(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveSection()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <NewSaleModal />
      <ReceiptModal />
      <WhatsAppReminderModal />
      <AddProductModal />
      <RestockModal />
      <RecordPaymentModal />
      <CustomerModal />
      <CustomerDetailModal />
      <DeleteCustomerConfirmModal />
      <ExpenseModal />
      <DeleteExpenseConfirmModal />
      <AnchorAuditModal />
      <AuditVerificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <MerchantProvider>
      <NearProvider>
        <AppContent />
      </NearProvider>
    </MerchantProvider>
  );
}


import React, { useState, useCallback, useEffect } from 'react';
import { AppNotification, NotificationType, ViewName, NavItem } from './types';
import { 
  WarningIcon, HomeIcon, KeyNavIcon, WalletIcon, BeakerIcon, GlossaryIcon, 
  ChatBubbleOvalLeftEllipsisIcon, AcademicCapIcon, BuildingStorefrontIcon, BlockchainIcon, RocketLaunchIcon, UserGroupIcon, MagnifyingGlassIcon
} from './components/Icons'; 
import NotificationArea from './components/NotificationArea';
import Header from './components/Header';
import HomeView from './views/HomeView';
import KeyGenerationView from './views/KeyGenerationView';
import WalletTypesView from './views/WalletTypesView';
import SimulatorView from './views/SimulatorView';
import GlossaryView from './views/GlossaryView';
import TransactionsExplainedView from './views/TransactionsExplainedView';
import ExchangesExplainedView from './views/ExchangesExplainedView';
import BlockchainDemoView from './views/BlockchainDemoView';
import TokenLifecycleView from './views/TokenLifecycleView';
import ChatbotComponent from './components/ChatbotComponent';
import ProjectTestAutomationView from './views/ProjectTestAutomationView'; // Added import

const navItems: NavItem[] = [
  { id: 'home', label: 'Trang Chủ', icon: HomeIcon },
  { id: 'keyGeneration', label: 'Sinh Khóa', icon: KeyNavIcon },
  { id: 'walletTypes', label: 'Các Loại Ví', icon: WalletIcon },
  { id: 'blockchainDemo', label: 'Tìm Hiểu Blockchain', icon: BlockchainIcon },
  { id: 'transactionsExplained', label: 'Giao Dịch Blockchain', icon: AcademicCapIcon},
  { id: 'exchangesExplained', label: 'Tìm Hiểu Sàn G.D', icon: BuildingStorefrontIcon },
  { id: 'tokenLifecycle', label: 'Vòng Đời Token', icon: RocketLaunchIcon },
  { id: 'projectTestAutomation', label: '🔍 Test Dự Án', icon: MagnifyingGlassIcon }, // Added new nav item
  { id: 'simulator', label: 'Mô Phỏng Ví', icon: BeakerIcon },
  { id: 'glossary', label: 'Thuật Ngữ', icon: GlossaryIcon },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  const addNotification = useCallback((message: string, type: NotificationType, duration: number = 3000) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  }, []); 

  const removeNotification = useCallback((id: string) => {
    setNotifications(currentNotifications => currentNotifications.filter(n => n.id !== id));
  }, []);
  
  const handleNavClick = (view: ViewName) => {
    setCurrentView(view);
  }

  const handleCopy = useCallback((textToCopy: string,itemName: string) => {
    navigator.clipboard.writeText(textToCopy);
    addNotification(`${itemName} đã được sao chép!`, 'success', 1500);
  },[addNotification]);

  const toggleChatbot = () => {
    setIsChatbotOpen(prev => !prev);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onNavigate={handleNavClick} addNotification={addNotification} />;
      case 'keyGeneration':
        return <KeyGenerationView onCopy={handleCopy} addNotification={addNotification} />;
      case 'walletTypes':
        return <WalletTypesView />;
      case 'blockchainDemo': 
        return <BlockchainDemoView />;
      case 'transactionsExplained':
        return <TransactionsExplainedView />;
      case 'exchangesExplained':
        return <ExchangesExplainedView />;
      case 'tokenLifecycle':
        return <TokenLifecycleView addNotification={addNotification} />;
      case 'projectTestAutomation': // Added case for new view
        return <ProjectTestAutomationView addNotification={addNotification} />;
      case 'simulator':
        return <SimulatorView 
                  onCopy={handleCopy} 
                  addNotification={addNotification} 
                />;
      case 'glossary':
        return <GlossaryView />;
      default:
        return <HomeView onNavigate={handleNavClick} addNotification={addNotification} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 flex flex-col items-center p-0 md:p-4 selection:bg-sky-500 selection:text-white relative">
      <NotificationArea notifications={notifications} onRemoveNotification={removeNotification} />
      
      <Header 
        navItems={navItems}
        currentView={currentView}
        onNavClick={handleNavClick}
      />

      <main className="w-full max-w-5xl bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-b-lg md:rounded-lg p-4 sm:p-6 md:p-8 ring-1 ring-slate-700 flex-grow">
        {renderView()}
      </main>

      <footer className="w-full max-w-5xl text-center py-6 md:py-8 mt-2 md:mt-8">
         <div className="bg-yellow-600/30 border-l-4 border-yellow-500 text-yellow-200 p-4 rounded-md shadow-lg mb-6 ring-1 ring-yellow-500/50 mx-2 md:mx-0" role="alert">
          <div className="flex items-center">
            <div className="py-1">
              <WarningIcon className="fill-current h-6 w-6 text-yellow-400 mr-4" />
            </div>
            <div>
              <p className="font-bold">LƯU Ý QUAN TRỌNG</p>
              <p className="text-sm">Đây là một nền tảng học tập và mô phỏng. Mọi địa chỉ ví, khóa riêng tư, cụm từ khôi phục và giao dịch đều là <strong className="text-yellow-300">GIẢ</strong> và chỉ dành cho mục đích học tập. <strong className="text-yellow-300 uppercase">Tuyệt đối không sử dụng thông tin từ ứng dụng này với tài sản mã hoá thật.</strong></p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Trần Tuấn Thành (trantuanthanh.net)
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Giảng viên Viện Công nghệ Blockchain và Trí tuệ nhân tạo (ABAII)
        </p>
      </footer>

      <button
        onClick={toggleChatbot}
        title="Mở Chatbot AI"
        aria-label="Mở Chatbot AI"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-sky-600 hover:bg-sky-500 text-white p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400/50 z-40"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      <ChatbotComponent 
        isOpen={isChatbotOpen} 
        onClose={toggleChatbot} 
        addNotification={addNotification}
      />

    </div>
  );
};

export default App;
import { X, Home, Calculator, HelpCircle, Info, Settings } from "lucide-react";
import { Link } from "wouter";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalculator: () => void;
}

export default function SideMenu({ isOpen, onClose, onOpenCalculator }: SideMenuProps) {
  return (
    <div 
      className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      ></div>
      <div className="relative w-64 max-w-xs h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-primary-600">Меню</h2>
          <button onClick={onClose} className="text-gray-500 focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/">
                <a className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary-600">
                  <Home className="mr-3 w-5 h-5" />
                  <span>Главная</span>
                </a>
              </Link>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onClose();
                  onOpenCalculator();
                }}
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary-600"
              >
                <Calculator className="mr-3 w-5 h-5" />
                <span>Калькулятор</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary-600">
                <HelpCircle className="mr-3 w-5 h-5" />
                <span>Частые вопросы</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary-600">
                <Info className="mr-3 w-5 h-5" />
                <span>О сервисе</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Link href="/admin/login">
            <a className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary-600">
              <Settings className="mr-3 w-5 h-5" />
              <span>Администрирование</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

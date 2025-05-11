import { Menu, Calculator as CalculatorIcon, User } from "lucide-react";
import { useState } from "react";
import SideMenu from "./SideMenu";

interface HeaderProps {
  onOpenCalculator: () => void;
}

export default function Header({ onOpenCalculator }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-20 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="mr-3 text-gray-700 focus:outline-none hover:bg-gray-100 p-2 rounded-full transition-colors"
                aria-label="Открыть меню"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-primary-700 tracking-tight">Займы онлайн</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenCalculator}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none transition-colors"
                aria-label="Открыть калькулятор"
              >
                <CalculatorIcon className="w-5 h-5" />
              </button>
              <button 
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none transition-colors"
                aria-label="Профиль пользователя"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onOpenCalculator={onOpenCalculator} />
    </>
  );
}

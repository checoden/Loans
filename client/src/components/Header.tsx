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
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="mr-3 text-gray-600 focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-primary-600">Займы онлайн</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={onOpenCalculator}
                className="p-2 text-gray-600 hover:text-primary-600 focus:outline-none"
              >
                <CalculatorIcon className="w-5 h-5" />
              </button>
              <button 
                className="p-2 ml-2 text-gray-600 hover:text-primary-600 focus:outline-none"
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

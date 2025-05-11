import { ArrowLeft } from "lucide-react";
import { Loan } from "@shared/schema";

interface WebViewProps {
  isOpen: boolean;
  loan: Loan | null;
  onClose: () => void;
}

export default function WebView({ isOpen, loan, onClose }: WebViewProps) {
  if (!isOpen || !loan) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="bg-white shadow-md p-3 flex items-center justify-between">
        <button 
          onClick={onClose} 
          className="text-gray-600 focus:outline-none"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-medium">Оформление займа: {loan.name}</span>
        <div className="w-8"></div> {/* For balance */}
      </div>
      <iframe 
        src={loan.link}
        className="w-full h-[calc(100%-56px)]"
        title={`Оформление займа в ${loan.name}`}
      ></iframe>
    </div>
  );
}

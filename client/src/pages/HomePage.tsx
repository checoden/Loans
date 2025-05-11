import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import FilterSection from "@/components/FilterSection";
import LoanItem from "@/components/LoanItem";
import WebView from "@/components/WebView";
import Calculator from "@/components/Calculator";
import { Loader2 } from "lucide-react";
import { Loan } from "@shared/schema";

export default function HomePage() {
  const [amount, setAmount] = useState(30000);
  const [term, setTerm] = useState(30);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isWebViewOpen, setIsWebViewOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  
  const { data: loans, isLoading, error } = useQuery<Loan[]>({
    queryKey: [`/api/loans?amount=${amount}&term=${term}`],
  });
  
  const handleFilterChange = (newAmount: number, newTerm: number) => {
    setAmount(newAmount);
    setTerm(newTerm);
  };
  
  const handleOpenWebView = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsWebViewOpen(true);
  };
  
  const handleCloseWebView = () => {
    setIsWebViewOpen(false);
    setSelectedLoan(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenCalculator={() => setIsCalculatorOpen(true)} />
      
      <FilterSection onFilterChange={handleFilterChange} />
      
      <main className="container mx-auto px-4 pb-8 pt-4">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mt-4">
              <p>Ошибка при загрузке предложений: {error.message}</p>
            </div>
          ) : loans && loans.length > 0 ? (
            <div className="space-y-5">
              <h2 className="text-lg font-medium text-gray-800">Найдено предложений: {loans.length}</h2>
              {loans.map((loan) => (
                <LoanItem 
                  key={loan.id} 
                  loan={loan} 
                  onOpenWebView={handleOpenWebView}
                />
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-5 rounded-lg mt-4">
              <p>Нет предложений, соответствующих выбранным параметрам. Попробуйте изменить сумму или срок займа.</p>
            </div>
          )}
        </div>
      </main>
      
      <WebView 
        isOpen={isWebViewOpen} 
        loan={selectedLoan} 
        onClose={handleCloseWebView} 
      />
      
      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
}

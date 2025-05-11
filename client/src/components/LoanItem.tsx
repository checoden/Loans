import { Button } from "@/components/ui/button";
import { Loan } from "@shared/schema";

interface LoanItemProps {
  loan: Loan;
  onOpenWebView: (loan: Loan) => void;
}

export default function LoanItem({ loan, onOpenWebView }: LoanItemProps) {
  const formatAmount = (amount: number) => {
    return `до ${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
  };
  
  const formatTerm = (from: number, to: number) => {
    return `${from} - ${to} дней`;
  };
  
  const formatRate = (rate: number, isFirstLoanZero: boolean) => {
    if (isFirstLoanZero) {
      return "от 0%";
    }
    return `от ${rate}%`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-4 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col p-4">
        {/* Header with logo and company name */}
        <div className="flex items-center gap-4 mb-3">
          <div className="w-24 h-14 flex-shrink-0 bg-white rounded-md border border-gray-100 flex items-center justify-center p-1">
            <img 
              src={loan.logo} 
              alt={`${loan.name} логотип`} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">{loan.name}</h3>
          </div>
          {loan.is_first_loan_zero && (
            <div className="flex-shrink-0">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap">
                0% первый займ
              </span>
            </div>
          )}
        </div>
        
        {/* Loan details */}
        <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Сумма</p>
            <p className="font-medium text-gray-800">{formatAmount(loan.amount)}</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Срок</p>
            <p className="font-medium text-gray-800">{formatTerm(loan.term_from, loan.term_to)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Ставка</p>
            <p className="font-medium text-gray-800">{formatRate(Number(loan.rate), loan.is_first_loan_zero)}</p>
          </div>
        </div>
        
        {/* CTA Button */}
        <Button 
          className="w-full h-12 text-base font-medium"
          onClick={() => onOpenWebView(loan)}
        >
          Получить займ
        </Button>
      </div>
    </div>
  );
}

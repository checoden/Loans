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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
      <div className="flex items-start p-4">
        <img 
          src={loan.logo} 
          alt={`${loan.name} логотип`} 
          className="w-14 h-14 rounded-full object-cover border border-gray-200"
        />
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900">{loan.name}</h3>
            {loan.is_first_loan_zero && (
              <div className="flex items-center">
                <span className="bg-secondary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  0% первый займ
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Сумма</p>
              <p className="font-medium">{formatAmount(loan.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Срок</p>
              <p className="font-medium">{formatTerm(loan.term_from, loan.term_to)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ставка</p>
              <p className="font-medium">{formatRate(Number(loan.rate), loan.is_first_loan_zero)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Одобрение</p>
              <p className="font-medium">{loan.approval_rate}%</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Button 
          className="w-full py-6 bg-primary-600 hover:bg-primary-700"
          onClick={() => onOpenWebView(loan)}
        >
          Получить займ
        </Button>
      </div>
    </div>
  );
}

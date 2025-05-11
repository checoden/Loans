import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSectionProps {
  onFilterChange: (amount: number, term: number) => void;
}

export default function FilterSection({ onFilterChange }: FilterSectionProps) {
  const [amount, setAmount] = useState(30000);
  const [term, setTerm] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format amount as currency
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  };
  
  // Format term with proper word form
  const formatTerm = (days: number) => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return days + ' дней';
    }
    
    if (lastDigit === 1) {
      return days + ' день';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return days + ' дня';
    }
    
    return days + ' дней';
  };
  
  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(amount, term);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [amount, term, onFilterChange]);
  
  return (
    <section className="bg-white shadow-md mb-6 sticky top-[61px] z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-800">Параметры займа</h2>
              <div className="flex items-center space-x-4 mt-1">
                <div className="text-sm text-gray-600">Сумма: <span className="font-medium text-primary-600">{formatAmount(amount)}</span></div>
                <div className="text-sm text-gray-600">Срок: <span className="font-medium text-primary-600">{formatTerm(term)}</span></div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <>Свернуть <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Развернуть <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="space-y-4 mt-4 pb-2">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="amount-slider" className="text-sm font-medium text-gray-700">
                    Сумма займа
                  </label>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    {formatAmount(amount)}
                  </span>
                </div>
                <Slider
                  id="amount-slider"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={[amount]}
                  onValueChange={(value) => setAmount(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 000 ₽</span>
                  <span>100 000 ₽</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="term-slider" className="text-sm font-medium text-gray-700">
                    Срок займа
                  </label>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    {formatTerm(term)}
                  </span>
                </div>
                <Slider
                  id="term-slider"
                  min={5}
                  max={365}
                  step={1}
                  value={[term]}
                  onValueChange={(value) => setTerm(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 дней</span>
                  <span>365 дней</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

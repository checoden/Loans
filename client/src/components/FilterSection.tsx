import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface FilterSectionProps {
  onFilterChange: (amount: number, term: number) => void;
}

export default function FilterSection({ onFilterChange }: FilterSectionProps) {
  const [amount, setAmount] = useState(30000);
  const [term, setTerm] = useState(30);
  
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
    <section className="bg-white shadow-sm mb-4 sticky top-[61px] z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="amount-slider" className="text-sm font-medium text-gray-700">
                Сумма займа
              </label>
              <span className="text-sm font-semibold text-primary-600">
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
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="term-slider" className="text-sm font-medium text-gray-700">
                Срок займа
              </label>
              <span className="text-sm font-semibold text-primary-600">
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
      </div>
    </section>
  );
}

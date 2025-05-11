import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [amount, setAmount] = useState(15000);
  const [term, setTerm] = useState(7);
  const [rate, setRate] = useState(1.0);
  const [totalToRepay, setTotalToRepay] = useState(0);
  const [overPayment, setOverPayment] = useState(0);
  const [dailyPayment, setDailyPayment] = useState(0);
  const [effectiveRate, setEffectiveRate] = useState(0);
  
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
  
  // Calculate loan statistics
  useEffect(() => {
    const dailyInterest = rate / 100;
    const totalInterest = amount * dailyInterest * term;
    const totalRepay = amount + totalInterest;
    const dailyPay = totalRepay / term;
    const effectiveR = dailyInterest * 365 * 100;
    
    setTotalToRepay(Math.round(totalRepay));
    setOverPayment(Math.round(totalInterest));
    setDailyPayment(Math.round(dailyPay));
    setEffectiveRate(Math.round(effectiveR));
  }, [amount, term, rate]);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={onClose}
      ></div>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-40 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Калькулятор займа</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="calc-amount-slider" className="text-sm font-medium text-gray-700">
                  Сумма займа
                </label>
                <span className="text-sm font-semibold text-primary-600">
                  {formatAmount(amount)}
                </span>
              </div>
              <Slider
                id="calc-amount-slider"
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
                <label htmlFor="calc-term-slider" className="text-sm font-medium text-gray-700">
                  Срок займа
                </label>
                <span className="text-sm font-semibold text-primary-600">
                  {formatTerm(term)}
                </span>
              </div>
              <Slider
                id="calc-term-slider"
                min={1}
                max={30}
                step={1}
                value={[term]}
                onValueChange={(value) => setTerm(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 день</span>
                <span>30 дней</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="calc-rate-input" className="text-sm font-medium text-gray-700">
                  Ставка (% в день)
                </label>
              </div>
              <Input
                id="calc-rate-input"
                type="number"
                min={0}
                max={3}
                step={0.01}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Расчет переплаты</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Сумма к возврату</p>
                <p className="font-semibold text-gray-900">{formatAmount(totalToRepay)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Переплата</p>
                <p className="font-semibold text-gray-900">{formatAmount(overPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ежедневный платеж</p>
                <p className="font-semibold text-gray-900">{formatAmount(dailyPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Эффективная ставка</p>
                <p className="font-semibold text-gray-900">{effectiveRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-4 px-1">
            * Расчет является предварительным и может отличаться от условий, предлагаемых МФО
          </div>
        </div>
      </div>
    </>
  );
}

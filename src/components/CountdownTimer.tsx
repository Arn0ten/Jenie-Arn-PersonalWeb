
import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import Confetti from 'react-confetti';
import { Heart } from 'lucide-react';

type CountdownProps = {
  anniversaryDate: Date;
};

const CountdownTimer: React.FC<CountdownProps> = ({ anniversaryDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    const calculateNextMonthsary = () => {
      const now = new Date();
      
      // Set the day to 23
      let nextMonthsary = new Date(now.getFullYear(), now.getMonth(), 23);
      
      // If today is past the 23rd, move to next month
      if (now.getDate() > 23) {
        nextMonthsary = new Date(now.getFullYear(), now.getMonth() + 1, 23);
      } else if (now.getDate() === 23 && 
                (now.getHours() > 0 || now.getMinutes() > 0 || now.getSeconds() > 0)) {
        // If it's the 23rd but time has passed, move to next month
        nextMonthsary = new Date(now.getFullYear(), now.getMonth() + 1, 23);
      }
      
      return nextMonthsary;
    };

    const updateCountdown = () => {
      const now = new Date();
      const nextMonthsary = calculateNextMonthsary();
      
      const days = differenceInDays(nextMonthsary, now);
      const hours = differenceInHours(nextMonthsary, now) % 24;
      const minutes = differenceInMinutes(nextMonthsary, now) % 60;
      const seconds = differenceInSeconds(nextMonthsary, now) % 60;
      
      setTimeLeft({ days, hours, minutes, seconds });

      // Trigger celebration if countdown reaches zero
      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 10000); // Stop after 10 seconds
      }
    };

    // Update immediately
    updateCountdown();
    
    // Then update every second
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getMonthsaryCount = () => {
    const now = new Date();
    const startYear = anniversaryDate.getFullYear();
    const startMonth = anniversaryDate.getMonth();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate months difference
    return (currentYear - startYear) * 12 + (currentMonth - startMonth);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto text-center p-6 rounded-lg bg-gradient-to-br from-romance-accent via-white to-romance-accent/20 backdrop-blur-sm shadow-lg animate-fade-in">
      {isCelebrating && (
        <Confetti 
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          colors={['#F472B6', '#EC4899', '#FDE1D3']}
        />
      )}
      <div className="mb-6 relative">
        <h2 className="text-4xl md:text-5xl font-bold text-romance-primary mb-2 cursive">
          Our Love Story
        </h2>
        <p className="text-lg text-romance-secondary">
          Since {anniversaryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          <span className="mx-2">•</span>
          <span className="font-semibold">{getMonthsaryCount()} months</span> of love
        </p>
        {isCelebrating && (
          <div className="absolute top-0 right-0 animate-pulse">
            <Heart className="h-12 w-12 text-pink-500 fill-pink-500" />
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl text-romance-secondary mb-4">Next Monthsary In:</h3>
        <div className="flex justify-center space-x-4 md:space-x-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <div 
                className={`text-3xl md:text-5xl font-bold text-romance-primary mb-1 ${
                  value === 0 ? 'animate-pulse' : ''
                }`}
              >
                {value}
              </div>
              <div className="text-xs md:text-sm text-gray-600 capitalize">
                {unit}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-lg text-gray-700 italic">
        "Every moment with you is a treasure, every day a blessing."
      </p>
    </div>
  );
};

export default CountdownTimer;

import React, { useState, useEffect } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import Confetti from "react-confetti";
import { Heart } from "lucide-react";

type CountdownProps = {
  anniversaryDate: Date;
};

const CountdownTimer: React.FC<CountdownProps> = ({ anniversaryDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
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
      } else if (
        now.getDate() === 23 &&
        (now.getHours() > 0 || now.getMinutes() > 0 || now.getSeconds() > 0)
      ) {
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
      if (days === 0 && hours === 0 && minutes === 0 && seconds <= 5) {
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 15000); // Celebrate for 15 seconds
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

  const getGradientClass = () => {
    // Return different gradients based on time left
    if (timeLeft.days === 0) {
      return "bg-gradient-to-br from-pink-400 via-pink-300 to-pink-200";
    } else if (timeLeft.days <= 3) {
      return "bg-gradient-to-br from-pink-300 via-orange-200 to-yellow-100";
    } else {
      return "bg-gradient-to-br from-romance-accent via-white to-romance-accent/20";
    }
  };

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto text-center p-6 rounded-lg ${getGradientClass()} backdrop-blur-sm shadow-lg animate-fade-in`}
    >
      {isCelebrating && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={500}
            colors={["#F472B6", "#EC4899", "#FDE1D3", "#FB7185", "#FECDD3"]}
            gravity={0.15}
          />
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <Heart
                key={i}
                className={`absolute animate-heart-float text-pink-400 fill-pink-400`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.7,
                  animation: `heart-float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  transform: `scale(${0.5 + Math.random()}) rotate(${Math.random() * 30}deg)`,
                }}
                size={20 + Math.random() * 30}
              />
            ))}
          </div>
        </>
      )}
      <div className="mb-6 relative">
        <h2
          className={`text-4xl md:text-5xl font-bold text-romance-primary mb-2 cursive ${isCelebrating ? "animate-pulse" : ""}`}
        >
          Our Love Story
        </h2>
        <p className="text-lg text-romance-secondary">
          Since{" "}
          {anniversaryDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          <span className="mx-2">•</span>
          <span className="font-semibold">{getMonthsaryCount()} months</span> of
          love
        </p>
        <div
          className={`absolute -top-4 right-0 ${isCelebrating ? "animate-heart-beat" : ""}`}
        >
          <Heart className="h-12 w-12 text-pink-500 fill-pink-500" />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl text-romance-secondary mb-4">
          Next Monthsary In:
        </h3>
        <div className="flex justify-center space-x-4 md:space-x-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <div
                className={`text-3xl md:text-5xl font-bold mb-1 ${
                  value === 0
                    ? "text-pink-500 animate-pulse"
                    : "text-romance-primary"
                } ${isCelebrating ? "animate-bounce" : ""}`}
                style={{
                  animationDelay: `${["days", "hours", "minutes", "seconds"].indexOf(unit) * 0.15}s`,
                }}
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

      <div
        className={`text-lg italic ${isCelebrating ? "text-pink-600" : "text-gray-700"}`}
      >
        {isCelebrating
          ? "Happy Monthsary! Today is our special day! ❤️"
          : "Every moment with you is a treasure, every day a blessing."}
      </div>

      {isCelebrating && (
        <div className="mt-4 flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-pink-400"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
              }}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;

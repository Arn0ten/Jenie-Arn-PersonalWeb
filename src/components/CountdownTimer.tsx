"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import Confetti from "react-confetti";
import { Heart, Quote, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

type CountdownProps = {
  anniversaryDate: Date;
};

// Array of love quotes
const loveQuotes = [
  {
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
  },
  {
    text: "I love you not because of who you are, but because of who I am when I am with you.",
    author: "Roy Croft",
  },
  {
    text: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle",
  },
  {
    text: "In all the world, there is no heart for me like yours.",
    author: "Maya Angelou",
  },
  {
    text: "I love you more than I have ever found a way to say to you.",
    author: "Ben Folds",
  },
  {
    text: "If I know what love is, it is because of you.",
    author: "Hermann Hesse",
  },
  {
    text: "You are my today and all of my tomorrows.",
    author: "Leo Christopher",
  },
  { text: "I am who I am because of you.", author: "Nicholas Sparks" },
  {
    text: "To love and be loved is to feel the sun from both sides.",
    author: "David Viscott",
  },
  {
    text: "Every love story is beautiful, but ours is my favorite.",
    author: "Unknown",
  },
  {
    text: "You're the first thing I think about when I wake up and the last thing I think about before I fall asleep.",
    author: "Unknown",
  },
  {
    text: "I fell in love the way you fall asleep: slowly, and then all at once.",
    author: "John Green",
  },
  {
    text: "I love you not only for what you are, but for what I am when I am with you.",
    author: "Elizabeth Barrett Browning",
  },
  {
    text: "You are my sun, my moon, and all my stars.",
    author: "E.E. Cummings",
  },
  {
    text: "I love you more than yesterday, but less than tomorrow.",
    author: "Rosemonde Gérard",
  },
];

const CountdownTimer: React.FC<CountdownProps> = ({ anniversaryDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState<{
    text: string;
    author: string;
  }>(loveQuotes[0]);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Function to get a random quote
  const getRandomQuote = () => {
    setIsLoadingQuote(true);

    // Simulate API call with a timeout
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * loveQuotes.length);
      setCurrentQuote(loveQuotes[randomIndex]);
      setIsLoadingQuote(false);
    }, 600);
  };

  useEffect(() => {
    // Initialize with a random quote
    getRandomQuote();

    // Set window size for Confetti
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);

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

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", updateWindowSize);
    };
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
    <motion.div
      className={`relative w-full max-w-4xl mx-auto text-center p-6 rounded-lg ${getGradientClass()} backdrop-blur-sm shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      ref={confettiRef}
    >
      {isCelebrating && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
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
      <div className="mb-6 relative flex flex-col md:block">
        <motion.h2
          className={`text-4xl md:text-5xl font-bold text-romance-primary mb-2 cursive ${isCelebrating ? "animate-pulse" : ""}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Love Story
        </motion.h2>
        <motion.p
          className="text-lg text-romance-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Since{" "}
          <span className="font-medium">
            {anniversaryDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="mx-2">•</span>
          <motion.span
            className="font-semibold bg-pink-100 px-2 py-0.5 rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getMonthsaryCount()} months
          </motion.span>{" "}
          of love
        </motion.p>
        {/* Desktop: show image top-right, Mobile: show image below */}
        <div className="hidden md:block">
          <motion.div
            className="
          absolute
          right-0
          top-0
          md:right-6
          md:-top-8
          sm:right-2
          sm:top-2
          z-10
        "
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1.25 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ rotate: 10, scale: 1.35 }}
          >
            <img
              src="/lock-heart.png"
              alt="Lock Heart"
              className={`
            h-12 w-12
            md:h-24 md:w-24
            ${isCelebrating ? "animate-heart-beat" : ""}
            block
          `}
              style={{
                right: 1,
                top: 0,
              }}
            />
          </motion.div>
        </div>
        <div className="flex justify-center mt-4 md:hidden">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1.25 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ rotate: 10, scale: 1.35 }}
          >
            <img
              src="/lock-heart.png"
              alt="Lock Heart"
              className={`
            h-16 w-16
            ${isCelebrating ? "animate-heart-beat" : ""}
            block
          `}
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-xl text-romance-secondary mb-4">
          Next Monthsary In:
        </h3>
        <div className="flex justify-center space-x-4 md:space-x-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <motion.div
              key={unit}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              onHoverStart={() => setHoveredUnit(unit)}
              onHoverEnd={() => setHoveredUnit(null)}
            >
              <motion.div
                className={`text-3xl md:text-5xl font-bold mb-1 ${
                  value === 0
                    ? "text-pink-500 animate-pulse"
                    : "text-romance-primary"
                } ${isCelebrating ? "animate-bounce" : ""}`}
                style={{
                  animationDelay: `${["days", "hours", "minutes", "seconds"].indexOf(unit) * 0.15}s`,
                }}
                animate={
                  hoveredUnit === unit
                    ? { scale: [1, 1.2, 1], rotate: [0, 5, 0, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {value < 10 ? `0${value}` : value}
              </motion.div>
              <div
                className={`text-xs md:text-sm capitalize px-2 py-0.5 rounded-full transition-colors duration-300 ${
                  hoveredUnit === unit
                    ? "bg-pink-100 text-pink-600"
                    : "text-gray-600"
                }`}
              >
                {unit}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Love Quote Section */}
      <motion.div
        className="mt-8 mb-4 relative bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="absolute -top-3 -left-3">
          <Quote size={24} className="text-pink-500" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="py-2"
          >
            {isLoadingQuote ? (
              <div className="flex justify-center items-center h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <RefreshCw size={24} className="text-pink-400" />
                </motion.div>
              </div>
            ) : (
              <>
                <p className="text-lg italic text-gray-700 mb-2">
                  "{currentQuote.text}"
                </p>
                <p className="text-sm text-gray-500">— {currentQuote.author}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <Button
          variant="ghost"
          size="sm"
          onClick={getRandomQuote}
          disabled={isLoadingQuote}
          className="mt-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50"
        >
          <RefreshCw size={14} className="mr-1" /> New Quote
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isCelebrating ? "celebrating" : "normal"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className={`text-lg italic ${isCelebrating ? "text-pink-600 font-medium" : "text-gray-700"}`}
        >
          {isCelebrating
            ? "Happy Monthsary! Today is our special day! ❤️"
            : "Every moment with you is a treasure, every day a blessing."}
        </motion.div>
      </AnimatePresence>

      {isCelebrating && (
        <motion.div
          className="mt-4 flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-pink-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            ></motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CountdownTimer;

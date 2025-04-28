import React from "react";
import { Heart } from "lucide-react";

const About = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center mb-12 animate-fade-in text-center md:text-left">
            <div>
              <h2 className="text-4xl md:text-5xl text-pink-500 font-bold mb-4 cursive">
                Our Story
              </h2>
            </div>
            <div className="md:ml-6 mt-4 md:mt-0 flex-shrink-0">
              <img
                src="/our-story.png"
                alt="Our Story"
                className="w-24 h-24 md:w-40 md:h-40 object-contain"
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 animate-fade-in">
            <h3 className="text-2xl text-pink-500 font-bold mb-4 cursive">
              How We Met
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed"></p>
            <p className="text-gray-700 mb-6 leading-relaxed">..</p>

            <h3 className="text-2xl text-pink-500 font-bold mb-4 cursive">
              Our First Date
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">..</p>

            <h3 className="text-2xl text-pink-500 font-bold mb-4 cursive">
              When We Knew
            </h3>
            <p className="text-gray-700 leading-relaxed">..</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in relative">
            {/* Bookmark image slightly higher and a bit right in the top right corner */}
            <img
              src="/favorite.png"
              alt="Favorite"
              className="absolute top-0 right-2 w-16 h-16 md:w-20 md:h-20 z-10"
              style={{ objectFit: "contain" }}
            />
            <h3 className="text-2xl text-pink-500 font-bold mb-4 text-center cursive">
              Our Favorite Things
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-pink-600 mb-2">
                  Jenie's Favorites
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Favorite food: Halang na fried chicken</li>
                  <li>Favorite movie: My Beloved Summer</li>
                  <li>Favorite song: "Rainbow" by Gatton</li>
                  <li>Favorite memory together: [memory]</li>
                  <li>What she loves about Arn: [qualities]</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-pink-600 mb-2">
                  Arn's Favorites
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Favorite food: Paksiw na bangus</li>
                  <li>Favorite movie: Drawing Closer</li>
                  <li>Favorite song: "Rainbow" by Gatton</li>
                  <li>Favorite memory together: No specific; Every Sunday</li>
                  <li>What he loves about Jenie: Kabalo na sya ana haha</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-pink-500 font-medium italic">
                "The best thing to hold onto in life is each other." — Audrey
                Hepburn
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 animate-fade-in relative overflow-hidden">
            {/* Animated adventures.png image at the bottom right, responsive */}
            <img
              src="/adventures.png"
              alt="Adventures"
              className="absolute bottom-2 right-2 w-24 h-24 md:w-36 md:h-36 object-contain pointer-events-none animate-adventure-move"
              style={{ zIndex: 1, maxWidth: "30vw", height: "auto" }}
            />
            <h3 className="text-2xl text-pink-500 font-bold mb-4 text-center cursive">
              Our Adventures
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">..</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>First trip together: </li>
              <li>Most unforgettable adventure: </li>
              <li>Funniest moment: </li>
              <li>Dream destination: </li>
            </ul>
            <style>
              {`
              @keyframes adventure-move {
              0% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0); }
              }
              .animate-adventure-move {
              animation: adventure-move 3s ease-in-out infinite;
              }
              `}
            </style>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 animate-fade-in relative">
            <h3 className="text-2xl text-pink-500 font-bold mb-4 text-center cursive">
              Our Promises
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">..</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>..</li>
              <li>..</li>
              <li>..</li>
              <li>..</li>
              <li>..</li>
            </ul>
            <img
              src="/promises.png"
              alt="Promises"
              className="absolute bottom-2 right-2 w-24 h-24 md:w-36 md:h-36 object-contain"
              style={{ maxWidth: "40vw", height: "auto" }}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
            <h3 className="text-2xl text-pink-500 font-bold mb-4 text-center cursive">
              Looking Forward
            </h3>
            <p className="text-gray-700 leading-relaxed">..</p>
            <div className="mt-6 text-center">
              <Heart className="w-8 h-8 mx-auto text-pink-200 fill-pink-500 animate-heart-beat" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

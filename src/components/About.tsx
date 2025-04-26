
import React from 'react';
import { Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl text-romance-primary font-bold mb-4 cursive">Our Story</h2>
            <div className="inline-block relative">
              <Heart className="w-8 h-8 mx-auto text-romance-accent fill-romance-primary animate-heart-beat" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 animate-fade-in">
            <h3 className="text-2xl text-romance-primary font-bold mb-4 cursive">How We Met</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              This is where we'll share the beautiful story of how we first met and how our love began. 
              Every love story is special, and ours is worth celebrating every day. From our first encounter 
              to the moment we knew we were meant to be together, this journey has been magical.
            </p>
            
            <h3 className="text-2xl text-romance-primary font-bold mb-4 cursive">Our First Date</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Our first date was unforgettable. We can describe all the details here - where we went, 
              what we talked about, and how we felt. Those special moments that made us realize this was 
              the beginning of something beautiful.
            </p>
            
            <h3 className="text-2xl text-romance-primary font-bold mb-4 cursive">When We Knew</h3>
            <p className="text-gray-700 leading-relaxed">
              There's always that moment when you just know. For us, it was [describe the moment]. 
              That feeling of certainty, of finding your person in this vast world. Every day since then 
              has been a blessing, and we continue to fall more in love with each passing day.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
            <h3 className="text-2xl text-romance-primary font-bold mb-4 text-center cursive">Our Favorite Things</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-romance-secondary mb-2">Jenie's Favorites</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Favorite food: [food]</li>
                  <li>Favorite movie: [movie]</li>
                  <li>Favorite song: [song]</li>
                  <li>Favorite memory together: [memory]</li>
                  <li>What she loves about Arn: [qualities]</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-romance-secondary mb-2">Arn's Favorites</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Favorite food: [food]</li>
                  <li>Favorite movie: [movie]</li>
                  <li>Favorite song: [song]</li>
                  <li>Favorite memory together: [memory]</li>
                  <li>What he loves about Jenie: [qualities]</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-romance-primary font-medium italic">
                "The best thing to hold onto in life is each other." — Audrey Hepburn
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

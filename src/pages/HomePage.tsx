
import React from 'react';
import CountdownTimer from '../components/CountdownTimer';
import Timeline from '../components/Timeline';

const anniversaryDate = new Date('2023-09-23');

const HomePage = () => {
  return (
    <div className="min-h-screen bg-romance-light">
      <div className="pt-24 pb-12 px-4 bg-gradient-to-b from-white to-romance-accent/20">
        <CountdownTimer anniversaryDate={anniversaryDate} />
      </div>
      <Timeline />
    </div>
  );
};

export default HomePage;
//    <!-- AYAW TAWON NI I SQL INJECT KAY WAKAY MAKUHA DNHI HAHA! -->
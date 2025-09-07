import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Warming up the AI artist...",
  "Applying professional lighting...",
  "Adjusting the perfect angle...",
  "Developing the images...",
  "Almost there, adding final touches..."
];

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center h-28 w-28">
         <div className="absolute h-full w-full rounded-full border-t-4 border-b-4 border-cyan-400 animate-spin"></div>
         <div className="absolute h-20 w-20 rounded-full border-l-4 border-r-4 border-purple-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <p className="mt-8 text-lg text-slate-200 font-medium text-center px-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;
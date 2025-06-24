import React from 'react';
import { HashLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <HashLoader size={60} color="red" />
    </div>
  );
};

export default Loading;

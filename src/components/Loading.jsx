import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HashLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Helmet>
            <title>Memuat data... </title>
         </Helmet>
      <HashLoader size={60} color="red" />
    </div>
  );
};

export default Loading;

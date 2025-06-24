import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListUser from './Views/ListUser';
import AbsenLayout from './Views/AbsenLayout';



const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ListUser />} />
        <Route path='/absensi/:id' element={<AbsenLayout />} />
       
      </Routes>
    </Router>
  );
};

export default AppRoutes;

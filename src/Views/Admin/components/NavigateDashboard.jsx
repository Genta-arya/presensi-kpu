import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Opsional: untuk ikon panah

const NavigateDashboard = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
    >
      <ArrowLeft size={18} />
      <span>Kembali</span>
    </button>
  );
};

export default NavigateDashboard;
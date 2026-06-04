import React, { useState, useEffect } from "react";
import { MapPin, Cloud, Sun, CloudRain, CloudLightning, Thermometer, Calendar, Clock } from "lucide-react";

const DateTimeWeather = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  const LAT = "0.009752495103421941";
  const LON = "110.95552433438533";
  const API_KEY = "dc3a3e1d66b5a35b2131a82f9c879edd";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    const getWeatherData = async () => {
      const cachedData = localStorage.getItem("weather_cache");
      const cacheTime = localStorage.getItem("weather_time");
      const isExpired = Date.now() - (cacheTime || 0) > 30 * 60 * 1000;

      if (cachedData && !isExpired) {
        setWeather(JSON.parse(cachedData));
      } else {
        try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`);
          const data = await res.json();
          if (data.cod === 200) {
            setWeather(data);
            localStorage.setItem("weather_cache", JSON.stringify(data));
            localStorage.setItem("weather_time", Date.now().toString());
          }
        } catch (error) { console.error("Gagal fetch:", error); }
      }
    };
    getWeatherData();
    return () => clearInterval(timer);
  }, []);

  const dateStr = new Intl.DateTimeFormat("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(time);
  const timeStr = time.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-4 mt-6 bg-gradient-to-br from-white to-gray-50 p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)]">
      {/* HEADER LOKASI */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
          <MapPin size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">Sekadau, Kalbar</span>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex items-center justify-between">
        {/* Sisi Kiri: Waktu & Tanggal */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-gray-800">
            <Clock size={16} className="text-gray-400" />
            <span className="text-3xl font-black tracking-tight font-mono">{timeStr}</span>
            <span className="text-xs font-bold text-gray-400 mt-1">WIB</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} />
            <span className="text-[11px] font-semibold">{dateStr}</span>
          </div>
        </div>

        {/* Sisi Kanan: Cuaca (Visual Clean) */}
        {weather && (
          <div className="flex flex-col items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
             <div className="text-gray-400 mb-1">
                {weather.weather[0].main === "Clear" ? <Sun size={20} className="text-amber-500" /> : <Cloud size={20} />}
             </div>
             <div className="flex items-center gap-1 font-bold text-gray-700">
                <Thermometer size={12} className="text-red-400" />
                <span className="text-sm">{Math.round(weather.main.temp)}°</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeWeather;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Store from './pages/Store';
import PrayerTimings from './pages/PrayerTimings';
import RamadanCalendar from './pages/RamadanCalendar';
import Quran from './pages/Quran';
import SurahPage from './pages/SurahPage';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/store" element={<Store />} />
        <Route path="/prayer-timings" element={<PrayerTimings />} />
        <Route path="/ramadan-calendar" element={<RamadanCalendar />} />
        <Route path="/quran" element={<Quran />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/quran/surah/:id" element={<SurahPage />} />
        <Route path="/quran/page/:id" element={<SurahPage />} />
        <Route path="/quran/page/:id/:verse" element={<SurahPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
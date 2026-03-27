import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import './global.css';
import App from './App';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </AppProvider>
  </StrictMode>
);

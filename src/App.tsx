import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Binder from './pages/Binder';
import CardDetail from './pages/CardDetail';
import AddPlant from './pages/AddPlant';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="binder" element={<Binder />} />
        <Route path="add" element={<AddPlant />} />
        <Route path="plant/:id" element={<CardDetail />} />
      </Route>
    </Routes>
  );
}

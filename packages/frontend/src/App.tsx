import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { RegisterPage } from './components/pages/RegisterPage';
import { ListPage } from './components/pages/ListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/estudiantes" element={<ListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

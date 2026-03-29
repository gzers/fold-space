import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MainCanvas from './pages/MainCanvas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/canvas" element={<MainCanvas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

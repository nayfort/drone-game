import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage/HomePage';
import GamePage from './pages/GamePage/GamePage';
import ScoreBoardPage from './pages/ScoreBoardPage/ScoreBoardPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

function App() {
  return (
    <>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<HomePage />} path="/home" />
        <Route element={<GamePage />} path="/game/:playerId" />
        <Route element={<ScoreBoardPage />} path="/records" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </>
  );
}

export default App;

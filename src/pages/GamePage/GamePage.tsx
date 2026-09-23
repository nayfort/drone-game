import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getPlayerToken, getCaveData } from '../../services/gameService';
import Cave from '../../components/Cave/Cave';
import Drone from '../../components/Drone/Drone';
import GameControl from '../../components/GameControl/GameControl';
import { Alert, Button, Modal } from 'antd';
import { CaveData, collides, DRONE_SIZE, ROW_HEIGHT } from '../../utils/game';

const GamePage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const complexity = Number(location.state?.complexity) || 0;
  const [cave, setCave] = useState<CaveData>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setResult(null);
    setScore(0);
    setSpeed({ x: 0, y: 0 });
    async function load() {
      try {
        if (!playerId) throw new Error('Missing player ID');
        const token = await getPlayerToken(playerId, controller.signal);
        const data = await getCaveData(playerId, token, controller.signal);
        if (controller.signal.aborted) return;
        setCave(data);
        setPosition({ x: (data[0][0] + data[0][1] - DRONE_SIZE) / 2, y: 0 });
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [playerId]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (loading || error || result) return;
    setSpeed(previous => ({
      x: Math.max(-5, Math.min(5, previous.x + (event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0))),
      y: Math.max(0, Math.min(5, previous.y + (event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0))),
    }));
  }, [loading, error, result]);

  useEffect(() => {
    if (loading || error || result || !cave.length) return;
    const timer = window.setInterval(() => {
      const next = { x: position.x + speed.x, y: position.y + speed.y };
      setPosition(next);
      if (collides(next.x, next.y, cave)) {
        setResult('loss');
        return;
      }
      if (next.y >= cave.length * ROW_HEIGHT) {
        setResult('win');
        return;
      }
      if (speed.y > 0) setScore(previous => previous + 10 * (speed.y + complexity));
    }, 50);
    return () => window.clearInterval(timer);
  }, [loading, error, result, cave, position, speed, complexity]);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert type="error" message="Unable to load the game. Please try again." action={<Button onClick={() => navigate('/')}>Back</Button>} />;
  const height = Math.max(viewport.height, cave.length * ROW_HEIGHT + DRONE_SIZE);
  const width = Math.max(viewport.width, ...cave.map(([, right]) => right));
  const cameraY = Math.max(0, position.y - viewport.height / 3);
  const cameraX = Math.max(0, Math.min(width - viewport.width, position.x - viewport.width / 2));
  return (
    <div style={{ position: 'relative', height: viewport.height, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width, height, transform: `translate(${-cameraX}px, ${-cameraY}px)` }}>
        <Cave wallHeight={ROW_HEIGHT} caveData={cave} height={height} width={width} />
        <Drone x={position.x} y={position.y} />
      </div>
      <GameControl onKeyDown={handleKeyDown} />
      <Modal open={result !== null} title={result === 'win' ? 'Congratulations!' : 'Game Over'} onCancel={() => navigate('/')} onOk={() => navigate('/')} okText="Play again" cancelText="Home">
        <p>{result === 'win' ? 'You win!' : 'Game Over!'} Your score is: {score}</p>
      </Modal>
    </div>
  );
};

export default GamePage;

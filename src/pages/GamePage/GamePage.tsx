import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { getPlayerToken, getCaveData } from '../../services/gameService';
import Cave from '../../components/Cave/Cave';
import Drone from '../../components/Drone/Drone';
import GameControl from '../../components/GameControl/GameControl';
import { Modal } from 'antd';

const GamePage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [caveData, setCaveData] = useState<[number, number][]>([]);
  const [dronePosition, setDronePosition] = useState({ x: 50, y: 10 });
  const [droneSpeed, setDroneSpeed] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [complexity, setComplexity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;

    switch (key) {
      case 'ArrowLeft':
        setDroneSpeed((prevSpeed) => ({
          ...prevSpeed,
          x: Math.max(-5, prevSpeed.x - 1),
        }));
        break;
      case 'ArrowRight':
        setDroneSpeed((prevSpeed) => ({
          ...prevSpeed,
          x: Math.min(5, prevSpeed.x + 1),
        }));
        break;
      case 'ArrowUp':
        setDroneSpeed((prevSpeed) => ({
          ...prevSpeed,
          y: Math.min(5, prevSpeed.y + 1),
        }));
        break;
      case 'ArrowDown':
        setDroneSpeed((prevSpeed) => ({
          ...prevSpeed,
          y: Math.max(-5, prevSpeed.y - 1),
        }));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (playerId) {
        setIsLoading(true);
        try {
          const token = await getPlayerToken(playerId);
          const caveData = await getCaveData(playerId, token);
          if (caveData.length > 0) {
            setCaveData(caveData);
          } else {
            console.error('Empty cave data received');
          }
        } catch (error) {
          console.error('Error fetching game data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [playerId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const updateGame = () => {
      const newX = dronePosition.x + droneSpeed.x;
      const newY = dronePosition.y + droneSpeed.y;
      setDronePosition({ x: newX, y: newY });

      const collision = detectCollision(newX, newY, caveData);
      if (collision) {
        setGameOver(true);
        return;
      }

      if (newY > window.innerHeight - 100) {
        setWin(true);
        return;
      }

      const scoreMultiplier = 10;
      const newScore = score + scoreMultiplier * (droneSpeed.y + complexity);
      setScore(newScore);
    };

    const gameLoop = setInterval(updateGame, 50);
    return () => clearInterval(gameLoop);
  }, [dronePosition, droneSpeed, caveData, complexity, score]);

  const detectCollision = (
    x: number,
    y: number,
    caveData: [number, number][]
  ) => {
    const droneWidth = 50;
    const droneHeight = 30;
    const wallHeight = 100;

    for (let i = 0; i < caveData.length; i++) {
      const [leftWall, rightWall] = caveData[i];

      if (y + droneHeight >= window.innerHeight - wallHeight) {
        if (x + droneWidth > leftWall && x < rightWall) {
          return true;
        }
      }

      if (y >= window.innerHeight - wallHeight) {
        if (x + droneWidth > leftWall && x < leftWall + wallHeight) {
          return true;
        }
        if (x < rightWall && x + droneWidth > rightWall - wallHeight) {
          return true;
        }
      } else {
        if (
          (x + droneWidth > leftWall && x < leftWall + wallHeight) ||
          (x < rightWall && x + droneWidth > rightWall - wallHeight)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    if (caveData.length > 0) {
      console.log(caveData);
    }
  }, [caveData]);

  return (
    <>
      {isLoading ? (
          <p>Loading...</p>
      ) : (
        <>
          <h2>Game is starting</h2>
          <Cave
            wallHeight={10}
            caveData={caveData}
            height={window.innerHeight}
            width={window.innerWidth}
          />
          <Drone x={dronePosition.x} y={dronePosition.y} />
          <GameControl onKeyDown={handleKeyDown} />
          <Modal
            open={gameOver}
            title="Game Over"
            onCancel={() => setGameOver(false)}
            onOk={() => window.location.reload()}
          >
            <p>Game Over! Your score is: {score}</p>
          </Modal>
          <Modal
            open={win}
            title="Congratulations!"
            onCancel={() => setWin(false)}
            onOk={() => window.location.reload()}
          >
            <p>You are win! Your score is: {score}</p>
          </Modal>
        </>
      )}
    </>
  );
};

export default GamePage;

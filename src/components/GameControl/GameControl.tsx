import { FC, useEffect } from 'react';

interface GameControlProps {
  onKeyDown: (event: KeyboardEvent) => void;
}

const GameControl: FC<GameControlProps> = ({ onKeyDown }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      onKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyDown]);

  return null;
};

export default GameControl;

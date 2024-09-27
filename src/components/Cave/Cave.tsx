import { FC } from 'react';
import './Cave.scss';

interface CaveProps {
  caveData: [number, number][];
  height: number;
  width: number;
  wallHeight: number;
}

const Cave: FC<CaveProps> = ({ caveData, height, width, wallHeight }) => {
  const isValidNumber = (value: number): boolean =>
    !isNaN(value) && isFinite(value);

  const pathData = caveData.flatMap(([left, right], index) => {
    const isLast = index === caveData.length - 1;
    const nextLeft = isLast ? width : caveData[index + 1][0];
    const nextRight = isLast ? width : caveData[index + 1][1];

    const safeLeft = isValidNumber(left) ? left : 0;
    const safeRight = isValidNumber(right) ? right : width;
    const safeNextLeft = isValidNumber(nextLeft) ? nextLeft : width;
    const safeNextRight = isValidNumber(nextRight) ? nextRight : width;

    return [
      `M ${safeLeft} ${height}`,
      `L ${safeRight} ${height}`,
      `L ${safeRight} ${height - wallHeight}`,
      `L ${safeNextRight} ${height - wallHeight}`,
      `L ${safeNextLeft} ${height - wallHeight}`,
      `L ${safeLeft} ${height}`,
    ];
  });

  return (
    <svg
      className="cave"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path d={pathData.join(' ')} fill="brown" />
    </svg>
  );
};

export default Cave;

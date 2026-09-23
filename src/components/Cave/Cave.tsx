import { FC } from 'react';
import './Cave.scss';

interface CaveProps {
  caveData: [number, number][];
  height: number;
  width: number;
  wallHeight: number;
}

const Cave: FC<CaveProps> = ({ caveData, height, width, wallHeight }) => (
  <svg className="cave" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
    {caveData.map(([left, right], index) => (
      <g key={index} fill="brown">
        <rect x={0} y={index * wallHeight} width={Math.max(0, left)} height={wallHeight} />
        <rect x={right} y={index * wallHeight} width={Math.max(0, width - right)} height={wallHeight} />
      </g>
    ))}
  </svg>
);

export default Cave;

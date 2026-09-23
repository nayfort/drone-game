import axios from 'axios';
import { CaveData } from '../utils/game';

const baseURL = import.meta.env.VITE_API_URL || 'https://cave-drone-server.shtoa.xyz';
const api = axios.create({ baseURL, timeout: 15000 });

export async function initGame(name: string, complexity: number): Promise<string> {
  const { data } = await api.post('/init', { name, complexity });
  if (typeof data.id !== 'string' || !data.id) throw new Error('Invalid player ID');
  return data.id;
}

export async function getPlayerToken(playerId: string, signal?: AbortSignal): Promise<string> {
  const responses = await Promise.all([1, 2, 3, 4].map(part =>
    api.get(`/token/${part}`, { params: { id: playerId }, signal })
  ));
  if (responses.some(({ data }) => typeof data.chunk !== 'string')) throw new Error('Invalid token');
  return responses.map(({ data }) => data.chunk).join('');
}

export function getCaveData(playerId: string, playerToken: string, signal?: AbortSignal): Promise<CaveData> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('Request cancelled')); return; }
    const url = new URL(baseURL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `${url.pathname.replace(/\/$/, '')}/cave`;
    const socket = new WebSocket(url);
    const cave: CaveData = [];
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      socket.close();
      if (error) reject(error);
      else resolve(cave);
    };
    const abort = () => finish(new Error('Request cancelled'));
    const timer = setTimeout(() => finish(new Error('Cave request timed out')), 30000);
    signal?.addEventListener('abort', abort, { once: true });
    socket.onopen = () => socket.send(`player:${playerId}-${playerToken}`);
    socket.onmessage = ({ data }) => {
      if (data === 'finished') {
        finish(cave.length ? undefined : new Error('Empty cave'));
        return;
      }
      const parts = typeof data === 'string' ? data.split(',') : [];
      const values = parts.map(Number);
      if (parts.length !== 2 || parts.some(part => !part.trim()) || !values.every(Number.isFinite) || values[0] >= values[1]) {
        finish(new Error('Invalid cave data'));
        return;
      }
      cave.push([values[0], values[1]]);
    };
    socket.onerror = () => finish(new Error('Cave connection failed'));
    socket.onclose = () => finish(new Error('Cave connection closed before completion'));
  });
}

import axios from "axios";

// const URL = 'https://cave-drone-server.shtoa.xyz';
const URL = 'https://cave-drone-client.shtoa.xyz';

export const initGame = async (name: string, complexity: number): Promise<string> => {
    try {
        const response = await axios.post(`${URL}/init`, { name, complexity });
        return response.data.id;
    } catch (error) {
        console.error('Error game init:', error);
        throw error;
    }
}

export const getPlayerToken = async (playerId: string): Promise<string> => {
    try {
        const tokenChunks = await Promise.all([
            axios.get(`${URL}/token/1?id=${playerId}`),
            axios.get(`${URL}/token/2?id=${playerId}`),
            axios.get(`${URL}/token/3?id=${playerId}`),
            axios.get(`${URL}/token/4?id=${playerId}`),
        ]);

        const token = tokenChunks
            .map((response) => response.data.chunk)
            .join('');

        return token;
    } catch (error) {
        console.error('Error receiving a token:', error);
        throw error;
    }
};

export const getCaveData = async (
    playerId: string,
    playerToken: string
): Promise<[number, number][]> => {
    try {
        const socket = new WebSocket(`wss://cave-drone-server.shtoa.xyz/cave`);

        socket.onopen = () => {
            socket.send(`player:${playerId}-${playerToken}`);
        };

        const caveData: [number, number][] = [];

        socket.onmessage = (event) => {
            if (event.data === 'finished') {
                socket.close();
            } else {
                const [left, right] = event.data.split(',').map(Number);
                caveData.push([left, right]);
            }
        };

        await new Promise((resolve) => {
            socket.onclose = resolve;
        });

        return caveData;
    } catch (error) {
        console.error('Error when retrieving cave data:', error);
        throw error;
    }
};




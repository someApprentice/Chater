import { io } from 'socket.io-client';

const socket = io();

socket.on('connect', () => { });

socket.on('error', (err) => console.error("Socket server refused to connect", err));

export default socket;

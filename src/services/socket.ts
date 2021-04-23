import { io } from 'socket.io-client';

const socket = io();

socket.on('connect', () => console.log("CONNECTED"));

socket.on('error', (err) => console.error("ERROR", err));

export default socket;

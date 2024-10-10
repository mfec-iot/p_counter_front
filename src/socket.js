import { io } from "socket.io-client";

const socket = io('https://mfec-counter.onrender.com', {
  transports: ['websocket'],
});

export default socket;

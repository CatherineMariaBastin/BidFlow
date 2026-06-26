import { io } from "socket.io-client";

const socketBaseUrl =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
  `http://${window.location.hostname}:5000`;

const socket = io(socketBaseUrl, {
  autoConnect: false,
});

export default socket;

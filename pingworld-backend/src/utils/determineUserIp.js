import ApiResponse from "../models/apiResponse.js";

const testIps = process.env.TEST_IPS ? process.env.TEST_IPS.split(",") : [];

export default function determineUserIp(socket) {
  if (!socket?.handshake?.address) {
    throw ApiResponse.BadRequestError("Socket handshake address is not available.");
  }

  const userIp =
    process.env.NODE_ENV === "production"
      ? socket.handshake.address
      : testIps.length > 0
      ? testIps[Math.floor(Math.random() * testIps.length)]
      : null;

  if (!userIp) {
    throw ApiResponse.BadRequestError("User IP address is not available.");
  }

  return userIp;
}

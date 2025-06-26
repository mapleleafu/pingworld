import fs from "fs";
import { Reader } from "@maxmind/geoip2-node";
import ApiResponse from "../models/apiResponse.js";
const dbBuffer = fs.readFileSync("./src/config/GeoLite2-City.mmdb");

export default function locateUserLocation(userIp) {
  if (!userIp) {
    throw ApiResponse.BadRequestError("User IP address is required to locate the user.");
  }
  if (typeof userIp !== "string") {
    throw ApiResponse.BadRequestError("User IP address must be a string.");
  }

  const reader = Reader.openBuffer(dbBuffer);
  const response = reader.city(userIp);
  const { latitude, longitude } = response.location;
  const country = response.country.isoCode;
  const continent = response.continent.code;
  return {
    latitude,
    longitude,
    country,
    continent,
  };
}

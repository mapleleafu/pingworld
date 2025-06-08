import { z } from "zod";

export const pingSchema = z.object({
  latitude: z
    .number({
      required_error: "Latitude is required.",
      invalid_type_error: "Latitude must be a number.",
    })
    .min(-90, { message: "Latitude must be between -90 and 90." })
    .max(90, { message: "Latitude must be between -90 and 90." }),
  longitude: z
    .number({
      required_error: "Longitude is required.",
      invalid_type_error: "Longitude must be a number.",
    })
    .min(-180, { message: "Longitude must be between -180 and 180." })
    .max(180, { message: "Longitude must be between -180 and 180." }),
});

import ApiResponse from "../models/apiResponse.js";

const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error.errors) {
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      const validationError = ApiResponse.BadRequestError(errorMessages[0].message);
      validationError.details = errorMessages;
      return next(validationError);
    }

    return next(ApiResponse.InternalServerError("Error during request validation."));
  }
};

export default validateRequest;

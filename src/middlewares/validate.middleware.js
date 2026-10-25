//Validates incoming request data before it reaches the controller

export const validate = (schema, source) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: ".البيانات المدخلة غير صحيحة. يرجى مراجعتها",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[source] = result.data;

    next();
  };
};

/* =====================================================
   VALIDATE MIDDLEWARE
   Usage: router.post("/login", validate(loginSchema), login)
===================================================== */
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      /* Zod ke naye versions me error-array ka naam "issues" hai,
         purane me "errors" tha — dono handle kar lete hain safely */
      const issues = result.error.issues || result.error.errors || [];
      const firstIssue = issues[0];

      return res.status(400).json({
        success: false,
        message: firstIssue?.message || "Invalid request data",
      });
    }

    req.body = result.data;
    next();
  };
};


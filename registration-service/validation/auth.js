const { z } = require('zod');

const RegisterSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain alphanumeric characters, dots, underscores, or hyphens"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Mobile number must match global E.164 format (e.g., +919876543210)"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

module.exports = { RegisterSchema };

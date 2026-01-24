import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/, {
      message: "Password must have an uppercase, a lowercase letter, and a number!",
    })
    .refine((val) => !/\s/.test(val), {
      message: "Password cannot contain spaces!",
    }),
});

export const signInSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string(),
  })
  .refine((data) => data.email || data.username, {
    message: "Email or Username required!",
    path: ["email", "username"],
  });

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

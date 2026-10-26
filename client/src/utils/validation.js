import { z } from 'zod';

export const emailField = z.string().trim().min(1, 'Enter your email').email('Enter a valid email address');

export const passwordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(80),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const loginSchema = z.object({ email: emailField, password: z.string().min(1, 'Enter your password') });
export const forgotSchema = z.object({ email: emailField });
export const resetSchema = z
  .object({ password: passwordField, confirmPassword: z.string().min(1, 'Confirm your password') })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: emailField,
  subject: z.string().trim().min(3, 'Add a short subject').max(120),
  message: z.string().trim().min(10, 'Write at least 10 characters').max(2000),
});

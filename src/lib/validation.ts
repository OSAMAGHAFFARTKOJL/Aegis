import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, "Type a question.").max(2000),
  securityOn: z.boolean(),
  conversationId: z.string().optional(),
});

export const documentSchema = z.object({
  title: z.string().trim().min(2).max(120),
  content: z.string().trim().min(1).max(20000),
  allowedRoles: z.array(z.enum(["employee", "hr", "admin"])).min(1),
});

export const roleSchema = z.object({
  role: z.enum(["employee", "hr", "admin"]),
});

export const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "New password must be at least 8 characters.").max(200).optional(),
  })
  .refine((d) => !d.newPassword || (d.currentPassword && d.currentPassword.length > 0), {
    message: "Enter your current password to set a new one.",
    path: ["currentPassword"],
  });

export const renameSchema = z.object({ title: z.string().trim().min(1).max(80) });

export type SignupInput = z.infer<typeof signupSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;

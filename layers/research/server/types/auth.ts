import { z } from 'zod'

// Base schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3),
  password_hash: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  last_login: z.date().nullable(),
  is_active: z.boolean(),
  deleted_at: z.date().nullable(),
})

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

export const profileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  display_name: z.string().min(1),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
})

export const workspaceRoleSchema = z.enum(['owner', 'admin', 'member', 'guest'])

export const workspaceMemberSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  role: workspaceRoleSchema,
  created_at: z.date(),
  updated_at: z.date(),
})

export const inviteStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'expired'])

export const workspaceInviteSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  invited_email: z.string().email(),
  invited_by: z.string().uuid(),
  role: workspaceRoleSchema,
  status: inviteStatusSchema,
  token: z.string(),
  expires_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
})

// Input schemas
export const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  useExistingProfile: z.boolean().optional(),
  profileId: z.string().uuid().optional(),
  displayName: z.string().min(1).optional(),
}).refine(
  (data) => {
    if (data.useExistingProfile) {
      return !!data.profileId
    }
    return !!data.displayName
  },
  {
    message: "Either profileId or displayName must be provided",
    path: ["profileId"],
  }
)

export const inviteToWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.string().email(),
  role: workspaceRoleSchema,
})

// Types
export type User = z.infer<typeof userSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type Profile = z.infer<typeof profileSchema>
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>
export type InviteStatus = z.infer<typeof inviteStatusSchema>
export type WorkspaceInvite = z.infer<typeof workspaceInviteSchema>

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type InviteToWorkspaceInput = z.infer<typeof inviteToWorkspaceSchema> 
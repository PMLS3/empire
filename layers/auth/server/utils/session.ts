import { H3Event } from 'h3'
import type { Profile, Workspace, WorkspaceRole } from '../../types/auth'
import type { Timestamp } from 'firebase/firestore'
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { readFileSync } from 'fs';
import { join } from 'path';
interface PublicUser {
  id: string
  email: string
  username: string
  token: any
}

interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export interface UserSession {
  user: PublicUser | null
  currentWorkspace: WorkspaceWithRole | null
  currentProfile: Profile | null
  workspaces: WorkspaceWithRole[]
  isAuthenticated: boolean
  token: any
}


const SESSION_NAME = 'auth:session'


export async function setUserSession(event: H3Event, session: UserSession) {
  // console.log('[Session] Setting user session:', session)
  await setCookie(event, SESSION_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
  console.log('[Session] User session set successfully')
}

export async function getUserSession(event: H3Event): Promise<UserSession | null> {
  console.log('[Session] Getting user session from cookie')
  const cookie = getCookie(event, SESSION_NAME)
  console.log('[Session] Cookie found:', !!cookie)
  
  if (!cookie) {
    console.log('[Session] No session cookie found')
    return null
  }
  
  try {
    const session = JSON.parse(cookie) as UserSession
    // console.log('[Session] Successfully parsed session:', {
    //   id: session.user?.id,
    //   email: session.user?.email,
    //   username: session.user?.username,
    //   workspaceId: session.currentWorkspace?.id,
    //   currentWorkspace: session.currentWorkspace,
    //   currentProfile: session.currentProfile,
    //   workspaces: session.workspaces,
    //   isAuthenticated: session.isAuthenticated,
    //   token: session.user?.token
    // })
    return session
  } catch (error) {
    console.error('[Session] Failed to parse session cookie:', error)
    return null
  }
}

export async function clearUserSession(event: H3Event) {
  console.log('[Session] Clearing user session')
  await deleteCookie(event, SESSION_NAME)
  console.log('[Session] User session cleared')
}

export async function createEmbeddings(data: any, col_vec: any) {
  const credentialsPath = join(process.cwd(), 'google-credentials.json');
  
  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8')) as GoogleCredentials;
  

  const embeddings = new VertexAIEmbeddings(
    {
      model:  'textembedding-gecko@latest',
      ...credentials
    }
  )
  console.log('!!!!!!!!!!!!!!!!!!!!')
  console.log('Data', data)
  console.log('Col vec', col_vec)
  const text = col_vec.map((key: string) => data[key]).join(' ');
  console.log('[Embeddings] Embedding text:', text);
  const vector = await embeddings.embedQuery(text);
  
  return vector
}
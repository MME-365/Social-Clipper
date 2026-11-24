import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the provisioned firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface YouTubeEngineFirestoreConfig {
  extractorProvider?: 'none' | 'cobalt' | 'rapidapi_yt_media' | 'custom_json';
  extractorUrl?: string;
  extractorApiKey?: string;
  extractorHostHeader?: string;
  proxyUrl?: string;
  cookiesTxt?: string;
  oauthCredentials?: Record<string, any> | null;
}

const YT_ENGINE_DOC_PATH = 'system_config/youtube_engine';

export async function loadYouTubeEngineFromFirestore(): Promise<YouTubeEngineFirestoreConfig | null> {
  if (!auth.currentUser) return null;
  try {
    const snap = await getDocFromServer(doc(db, 'system_config', 'youtube_engine'));
    if (!snap.exists()) return null;
    return snap.data() as YouTubeEngineFirestoreConfig;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, YT_ENGINE_DOC_PATH);
  }
}

export async function saveYouTubeEngineToFirestore(config: YouTubeEngineFirestoreConfig): Promise<void> {
  const adminEmail = auth.currentUser?.email;
  if (!adminEmail) return;

  const existingSnap = await (async () => {
    try {
      return await getDocFromServer(doc(db, 'system_config', 'youtube_engine'));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, YT_ENGINE_DOC_PATH);
    }
  })();

  const existingData = existingSnap.exists() ? (existingSnap.data() as Record<string, any>) : {};

  // Build strict allowlisted payload matching firebase-blueprint.json & firestore.rules
  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
    updatedBy: adminEmail.toLowerCase().slice(0, 256),
  };

  const provider = config.extractorProvider ?? existingData.extractorProvider;
  if (provider && ['none', 'cobalt', 'rapidapi_yt_media', 'custom_json'].includes(provider)) {
    payload.extractorProvider = provider;
  }
  const url = config.extractorUrl !== undefined ? config.extractorUrl : existingData.extractorUrl;
  if (typeof url === 'string' && url.length > 0) payload.extractorUrl = url.slice(0, 1024);

  const apiKey = config.extractorApiKey !== undefined ? config.extractorApiKey : existingData.extractorApiKey;
  if (typeof apiKey === 'string' && apiKey.length > 0) payload.extractorApiKey = apiKey.slice(0, 1024);

  const hostHeader = config.extractorHostHeader !== undefined ? config.extractorHostHeader : existingData.extractorHostHeader;
  if (typeof hostHeader === 'string' && hostHeader.length > 0) payload.extractorHostHeader = hostHeader.slice(0, 256);

  const proxyUrl = config.proxyUrl !== undefined ? config.proxyUrl : existingData.proxyUrl;
  if (typeof proxyUrl === 'string' && proxyUrl.length > 0) payload.proxyUrl = proxyUrl.slice(0, 1024);

  const cookiesTxt = config.cookiesTxt !== undefined ? config.cookiesTxt : existingData.cookiesTxt;
  if (typeof cookiesTxt === 'string' && cookiesTxt.length > 0) payload.cookiesTxt = cookiesTxt.slice(0, 200000);

  const oauthCreds = config.oauthCredentials === null
    ? undefined
    : (config.oauthCredentials !== undefined ? config.oauthCredentials : existingData.oauthCredentials);
  if (oauthCreds && typeof oauthCreds === 'object' && !Array.isArray(oauthCreds) && Object.keys(oauthCreds).length <= 20) {
    payload.oauthCredentials = oauthCreds;
  }

  try {
    await setDoc(doc(db, 'system_config', 'youtube_engine'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, YT_ENGINE_DOC_PATH);
  }
}

export async function clearYouTubeEngineInFirestore(): Promise<void> {
  if (!auth.currentUser) return;
  try {
    await deleteDoc(doc(db, 'system_config', 'youtube_engine'));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, YT_ENGINE_DOC_PATH);
  }
}

// Connection test on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

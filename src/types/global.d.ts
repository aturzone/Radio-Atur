
// Google API Types
interface GapiClient {
  init: (args: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
  getToken: () => { access_token: string } | null;
  setToken: (token: { access_token: string } | null) => void;
  request: (args: any) => Promise<any>;
  gmail: {
    users: {
      getProfile: (params: { userId: string }) => Promise<{
        result: { emailAddress: string }
      }>;
    };
  };
  drive: {
    files: {
      list: (params: any) => Promise<{
        result: { files: Array<{ id: string; name: string; modifiedTime?: string }> }
      }>;
      get: (params: any) => Promise<any>;
      create: (params: any) => Promise<{ result: { id: string } }>;
    };
  };
}

interface Gapi {
  load: (api: string, callback: { 
    callback: () => void; 
    onerror: (error: any) => void 
  }) => void;
  client: GapiClient;
}

interface GoogleOauth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: any) => void;
  }) => {
    requestAccessToken: (args?: { prompt?: string }) => void;
    callback: (response: any) => void;
  };
  revoke: (token: string, callback?: () => void) => void;
}

interface Google {
  accounts: {
    oauth2: GoogleOauth2;
  };
}

declare global {
  interface Window {
    gapi: Gapi;
    google: Google;
  }
}


/// <reference types="vite/client" />

// Google API Type Declarations
interface Window {
  gapi: {
    load: (api: string, callback: { callback: () => void; onerror: (error: any) => void }) => void;
    client: {
      init: (args: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
      getToken: () => { access_token: string } | null;
      setToken: (token: { access_token: string } | null) => void;
      request: (args: any) => Promise<any>;
      gmail: {
        users: {
          getProfile: (args: { userId: string }) => Promise<{ result: { emailAddress: string } }>;
        };
      };
      drive: {
        files: {
          list: (args: any) => Promise<{
            result: {
              files?: Array<{
                id: string;
                name: string;
                modifiedTime?: string;
              }>;
            };
          }>;
          get: (args: any) => Promise<any>;
          create: (args: any) => Promise<{ result: { id: string } }>;
        };
      };
    };
  };
  
  google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: any) => void;
        }) => {
          requestAccessToken: (args?: { prompt?: string }) => void;
          callback: (response: any) => void;
        };
        revoke: (token: string, callback?: () => void) => void;
      };
    };
  };
}

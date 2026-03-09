export interface IPTVResponse {
  status: string;
  message: string;
  user_id?: string;
  url?: string;
  code?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

export const iptvService = {
  async provision(type: 'mag' | 'm3u', identifier: string, sub: string, pack: string, resellerUid: string): Promise<IPTVResponse> {
    const response = await fetch('/api/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, identifier, sub, pack, resellerUid })
    });
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  },

  async renew(type: 'mag' | 'm3u', identifier: string, sub: string, resellerUid: string): Promise<IPTVResponse> {
    const response = await fetch('/api/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, identifier, sub, resellerUid })
    });
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  },

  async getPackages(): Promise<any> {
    const response = await fetch('/api/packages', { method: 'POST' });
    return await response.json();
  },

  async getResellerInfo(): Promise<IPTVResponse> {
    const response = await fetch('/api/reseller-info', { method: 'POST' });
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  }
};

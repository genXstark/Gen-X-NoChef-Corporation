export type UserRole = 'ADMIN' | 'RESELLER' | 'SUBSELLER';
export type UserStatus = 'pending' | 'approved';
export type LineType = 'MAG' | 'M3U';
export type LineStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED' | 'REFUNDED';
export type SubType = 'NEW' | 'RENEW' | 'DEMO';
export type AnnouncementKind = 'ANNOUNCEMENT' | 'WARNING';
export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface User {
  uid: string;
  email: string;
  username: string;
  role: UserRole;
  parentId?: string;
  credits: number;
  status: UserStatus;
  createdAt: string;
}

export interface Line {
  id: string;
  type: LineType;
  identifier: string; // MAC or username
  password?: string;
  customerName: string;
  packageId: string;
  resellerUid: string;
  subsellerUid?: string;
  subType: SubType;
  status: LineStatus;
  maxConnections: number;
  startDate: string;
  expireDate: string;
  createdAt: string;
  onlineStatus?: boolean;
  currentIp?: string;
  currentIps?: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  lineId?: string;
  type: 'CREDITADD' | 'CREDITUSE' | 'REFUND';
  amount: number;
  createdAt: string;
}

export interface Log {
  id: string;
  actorId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  description: string;
  ip: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  title: string;
  body: string;
  active: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  subject: string;
  category: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface ApiSettings {
  apiKey: string;
  panelUsername: string;
  panelPassword: string;
  panelBaseUrl: string;
}

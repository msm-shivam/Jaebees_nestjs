export interface JwtPayload {
  sub: string;
  email: string;
  type: 'customer';
}

export interface AdminJwtPayload {
  sub: string;
  email: string;
  type: 'admin';
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'customer' | 'admin';
}

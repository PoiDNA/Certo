export type AuthUser = {
  id: string;
  email: string | undefined;
  name: string | undefined;
  avatar_url: string | undefined;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  expires_at: number;
};

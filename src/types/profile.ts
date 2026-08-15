export type Profile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = {
  username: string;
  displayName: string;
  bio: string;
};

export type ProfileSearchResult = Pick<
  Profile,
  'id' | 'username' | 'displayName' | 'avatarUrl'
>;

export type MemberListData = {
  data: {
    members: MemberState[];
  };
  references: Reference[];
  retrieval_date: string;
};

export type MemberState = {
  name: string;
  alpha3: string | null;
  status: 'confirmed' | 'invited' | 'declined';
  references: Reference[];
};

export type Reference = {
  type?: string;
  text: string;
  link: string | null;
};
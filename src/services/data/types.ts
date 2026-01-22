export type MemberListData = {
  data: {
    members: {
      confirmed: MemberState[];
      invited: MemberState[];
      declined: MemberState[];
    };
  };
  references: Reference[];
  retrieval_date: string;
};

export type MemberState = {
  name: string;
  alpha3: string | null;
  references: Reference[];
};

export type Reference = {
  type?: string;
  text: string;
  link: string | null;
};
export type MemberListData = {
  members: {
    confirmed: MemberCountry[];
    invited: MemberCountry[];
    declined: MemberCountry[];
  };
  references: Reference[];
  retrieval_date: string;
};

export type MemberCountry = {
  name: string;
  references: Reference[];
};

export type Reference = {
  type?: string;
  text: string;
  link: string | null;
};
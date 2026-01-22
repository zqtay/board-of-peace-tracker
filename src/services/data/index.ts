import type { MemberListData } from "./types";

const getMemberList = async (): Promise<MemberListData> => {
  const response = await fetch("./data.json");
  const data = await response.json();
  return data;
};

export const DataService = {
  getMemberList
};
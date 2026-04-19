import type { MemberListData, StatusConfig } from "./types";
import memberListJson from "./data.json?url";
import stateGeoJson from "./state.geojson?url";
import statusConfigJson from "./config.json?url";

const getMemberList = async (): Promise<MemberListData> => {
  const response = await fetch(memberListJson);
  const data = await response.json();
  return data;
};

const getStateGeoJson = async (): Promise<any> => {
  const response = await fetch(stateGeoJson);
  const data = await response.json();
  return data;
};

const getStatusConfig = async (): Promise<StatusConfig[]> =>   {
  const response = await fetch(statusConfigJson);
  const data = await response.json();
  return data;
};

export const DataService = {
  getMemberList,
  getStateGeoJson,
  getStatusConfig,
};
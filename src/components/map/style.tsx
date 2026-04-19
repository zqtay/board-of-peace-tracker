import type { MemberState, StatusConfig } from "../../services/data/types";

const DEFAULT_COLOR = "#6c757d";

export const defaultStateStyle = {
  fillColor: DEFAULT_COLOR,
  fillOpacity: 0.7,
  color: "black",
  weight: 1,
  className: "transition",
};

export const getMemberStateStyle = (member: MemberState, statusConfig: StatusConfig[]) => {
  const config = statusConfig.find(c => c.status === member?.status);
  const fillColor = config?.color ?? DEFAULT_COLOR;
  return {
    fillColor,
    fillOpacity: 0.7,
    color: "black",
    weight: 1,
    className: "transition",
  };
};

export const highlightStyle = {
  weight: 2,
  fillOpacity: 1,
};

export const resetStyle = {
  weight: 1,
  fillOpacity: 0.7,
};
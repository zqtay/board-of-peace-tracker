import type { MemberState } from "../../services/data/types";

export const defaultStateStyle = {
  fillColor: "#6c757d", // Default gray
  fillOpacity: 0.7,
  color: "black",
  weight: 1,
  className: "transition",
};

export const getMemberStateStyle = (member: MemberState) => {
  // Red for confirmed
  // Orange for intend to accept
  // Blue for declined
  // Yellow for invited
  // Gray for not involved
  // Purple for withdrawn
  let fillColor = "#6c757d";
  switch (member?.status) {
    case "accepted":
      fillColor = "#dc3545";
      break;
    case "intendToAccept":
      fillColor = "#fd7e14";
      break;
    case "declined":
      fillColor = "#007bff";
      break;
    case "invited":
      fillColor = "#ffc107";
      break;
    case "withdrawn":
      fillColor = "#6f42c1";
      break;
  }
  return {
    fillColor,
    fillOpacity: 0.7, // Keep this low so you can see the map behind
    color: "black",   // Border color
    weight: 1,        // Border thickness
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
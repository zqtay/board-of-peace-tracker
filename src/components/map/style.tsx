import type { MemberState } from "../../services/data/types";

export const defaultStateStyle = {
  fillColor: "white", // Default gray
  fillOpacity: 0.7,
  color: "black",
  weight: 1,
  className: "transition",
};

export const getMemberStateStyle = (member: MemberState) => {
  // Red for confirmed
  // Blue for declined
  // Yellow for invited
  // Gray for not involved
  let fillColor = "#6c757d";
  switch (member?.status) {
    case "confirmed":
      fillColor = "#dc3545";
      break;
    case "declined":
      fillColor = "#007bff";
      break;
    case "invited":
      fillColor = "#ffc107";
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
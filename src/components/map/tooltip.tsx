import type { Feature, Geometry } from "geojson";
import type { MemberState } from "../../services/data/types";

export const getMemberStateTooltip = (member: MemberState | undefined, feature: Feature<Geometry>) => {
  const countryName = feature.properties?.admin;
  let status = "Not Invited";
  switch (member?.status) {
    case "confirmed":
      status = "Confirmed";
      break;
    case "invited":
      status = "Invited";
      break;
    case "declined":
      status = "Declined";
      break;
  }
  return `<div>
    <h3>${countryName}</h3>
    <p>Status: <strong>${status}</strong></p>
    ${(member?.references && member.references.length > 0) ? `
    <ul>
    ${member.references.map(e => `<li><a href="${e.link}">${e.text}</a></li>`).join("")}
    </ul>` : ""}
  </div>`;
};
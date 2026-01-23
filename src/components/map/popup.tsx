import type { Feature, Geometry } from "geojson";
import type { MemberState } from "../../services/data/types";
import type { Dispatch, ReactNode } from "react";

export type PopupState = {
  code?: string | null;
  visible: boolean;
  content: ReactNode;
  locked: boolean;
};

export const getMemberStatePopup = (
  member: MemberState | undefined,
  feature: Feature<Geometry>,
  setPopupState: Dispatch<React.SetStateAction<PopupState>>
) => {
  const countryName = feature.properties?.admin;
  const a2code = feature.properties?.iso_a2_eh?.toLowerCase();
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
    case "withdrawn":
      status = "Withdrawn";
      break;
  }
  return <div style={{ position: "relative", paddingRight: "16px" }}>
    <div
      style={{ position: "absolute", top: "0", right: "0", color: "#888", cursor: "pointer" }}
      title="Close"
      onClick={() => setPopupState({ code: null, content: null, visible: false, locked: false })}
    >
      X
    </div>
    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
      <img
        src={`https://flagcdn.com/${a2code}.svg`}
        alt={`${countryName} Flag`}
        style={{ width: "auto", height: "20px", boxShadow: "0 0 2px rgba(0,0,0,0.3)" }}
      />
      <div style={{ fontSize: "20px", fontWeight: 600 }}>{countryName}</div>
    </div>

    <div style={{ fontSize: "16px" }}>Status: <strong>{status}</strong></div>
    {(member?.references && member.references.length > 0) ?
      <ul>
        {member.references.map((e, i) =>
          <li key={`ref-${i}`}>
            <a href={e.link!}>{e.text}</a>
          </li>
        )}
      </ul>
      : ""
    }
  </div>;
};
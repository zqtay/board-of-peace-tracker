import { useState, type FC } from "react";
import type { MemberListData, MemberState, StatusConfig } from "../../services/data/types";

type LegendProps = {
  memberData?: MemberListData;
  statusConfig: StatusConfig[];
};

const stateList = (states: MemberState[]) => {
  return <ul>
    {states.map((s, i) =>
      <li key={`legend-state-${i}`}>
        {s.alpha2 && <img
          src={`https://flagcdn.com/${s.alpha2?.toLowerCase()}.svg`}
          alt={`${s.name} Flag`}
          style={{ width: "auto", height: "16px", boxShadow: "0 0 2px rgba(0,0,0,0.3)", marginRight: "8px" }}
        />}
        {s.name}
      </li>
    )}
  </ul>;
};

const DEFAULT_COLOR = "#6c757d";

export const Legend: FC<LegendProps> = ({ memberData, statusConfig }) => {
  const [popupVisible, setPopupVisible] = useState(false);

  const statusGroups = statusConfig.map(config => ({
    ...config,
    members: memberData?.data.members.filter(m => m.status === config.status) ?? [],
  }));

  return <>
    <div className="card legend" onClick={() => setPopupVisible(true)}>
      <table>
        {statusGroups.map((group) => (
          <tr key={`legend-${group.status}`}>
            <td><span className="legend-box" style={{ backgroundColor: group.color }}></span></td>
            <td>{group.label}</td>
            {memberData && <td style={{ textAlign: "right" }}>{group.members.length}</td>}
          </tr>
        ))}
        <tr>
          <td><span className="legend-box" style={{ backgroundColor: DEFAULT_COLOR }}></span></td>
          <td>Not invited</td>
        </tr>
      </table>
    </div>
    {memberData && popupVisible && <div className="card legend-popup">
      <div
        style={{ position: "absolute", top: "8px", right: "8px", color: "#888", cursor: "pointer" }}
        title="Close"
        onClick={() => setPopupVisible(false)}
      >
        X
      </div>
      {statusGroups.map((group) => (
        group.members.length > 0 && <div key={`popup-${group.status}`}>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>{group.label}</div>
          {stateList(group.members)}
        </div>
      ))}
    </div>}
    <div className="card reference">
      {memberData?.references && memberData.references.length > 0 && (
        <div>
          {memberData.references.map((ref, i) => (
            <div key={`ref-${i}`}>
              <a href={ref.link!} target="_blank" rel="noopener noreferrer">
                {ref.text}
              </a>
            </div>
          ))}
          Retrieved at {new Date(memberData.retrieval_date).toLocaleString()}
        </div>
      )}
    </div>
  </>;
};
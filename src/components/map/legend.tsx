import { useState, type FC } from "react";
import type { MemberListData, MemberState } from "../../services/data/types";

type LegendProps = {
  memberData?: MemberListData;
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

export const Legend: FC<LegendProps> = ({ memberData }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const confirmedList = memberData?.data.members.filter(m => m.status === "confirmed");
  const invitedList = memberData?.data.members.filter(m => m.status === "invited");
  const declinedList = memberData?.data.members.filter(m => m.status === "declined");
  const withdrawnList = memberData?.data.members.filter(m => m.status === "withdrawn");

  return <>
    <div className="card legend" onClick={() => setPopupVisible(true)}>
      <table>
        <tr>
          <td><span className="legend-box confirmed"></span></td>
          <td>Confirmed</td>
          {confirmedList && <td style={{ textAlign: "right" }}>{confirmedList.length}</td>}
        </tr>
        <tr>
          <td><span className="legend-box invited"></span></td>
          <td>Invited</td>
          {invitedList && <td style={{ textAlign: "right" }}>{invitedList.length}</td>}
        </tr>
        <tr>
          <td><span className="legend-box declined"></span></td>
          <td>Declined</td>
          {declinedList && <td style={{ textAlign: "right" }}>{declinedList.length}</td>}
        </tr>
        <tr>
          <td><span className="legend-box withdrawn"></span></td>
          <td>Withdrawn</td>
          {withdrawnList && <td style={{ textAlign: "right" }}>{withdrawnList.length}</td>}
        </tr>
        <tr>
          <td><span className="legend-box not-invited"></span></td>
          <td>Not Invited</td>
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
      <div style={{ fontWeight: 600, fontSize: "16px" }}>Confirmed</div>
      {stateList(confirmedList!)}
      <div style={{ fontWeight: 600, fontSize: "16px" }}>Invited</div>
      {stateList(invitedList!)}
      <div style={{ fontWeight: 600, fontSize: "16px" }}>Declined</div>
      {stateList(declinedList!)}
      <div style={{ fontWeight: 600, fontSize: "16px" }}>Withdrawn</div>
      {stateList(withdrawnList!)}
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
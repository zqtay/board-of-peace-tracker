import { CircleMarker, Tooltip } from "react-leaflet";
import { getCenter, SMALL_COUNTRIES_CODES } from "../../lib/map";
import type { FC } from "react";
import type { MemberListData, StateGeoJson } from "../../services/data/types";
import { defaultStateStyle, getMemberStateStyle } from "./style";
import { getMemberStateTooltip } from "./tooltip";

type SmallStateMarkersProps = {
  // No props needed for now
  geoJson: StateGeoJson;
  memberData: MemberListData;
};

export const SmallStatesMarkers: FC<SmallStateMarkersProps> = ({ geoJson, memberData }) => {
  return geoJson.features.map((feature, index) => {

    // Check if this feature is in our "Small Country" list
    const countryCode = feature.properties?.iso_a3_eh; // Adjust property name to match your JSON
    if (!SMALL_COUNTRIES_CODES.includes(countryCode)) return null;

    const center = getCenter(feature.geometry);

    const member = memberData?.data?.members.find(
      (m) => m.alpha3 === feature.properties?.iso_a3_eh
    );
    const style = member ? getMemberStateStyle(member!) : defaultStateStyle;

    return (
      <CircleMarker
        key={index}
        center={center}
        radius={6} // Fixed pixel size (always visible)
        pathOptions={style}
      >
        <Tooltip direction="auto" offset={[0, -5]} opacity={1} content={getMemberStateTooltip(member, feature)}>
        </Tooltip>
      </CircleMarker>
    );
  });
};
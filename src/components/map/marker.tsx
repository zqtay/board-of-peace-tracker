import { CircleMarker } from "react-leaflet";
import { getCenter, SMALL_COUNTRIES_CODES } from "../../lib/map";
import { useMemo, type Dispatch, type FC, type SetStateAction } from "react";
import type { MemberListData, StateGeoJson } from "../../services/data/types";
import { defaultStateStyle, getMemberStateStyle, highlightStyle } from "./style";
import { type PopupState } from "./popup";
import { getEventHandlers } from "./event";

type SmallStateMarkersProps = {
  geoJson: StateGeoJson;
  memberData: MemberListData;
  popup: PopupState;
  setPopup: Dispatch<SetStateAction<PopupState>>;
};

export const SmallStateMarkers: FC<SmallStateMarkersProps> = ({
  geoJson, memberData, popup, setPopup
}) => {
  return geoJson.features.map((feature, index) => {

    // Check if this feature is in our "Small Country" list
    const countryCode = feature.properties?.iso_a3_eh; // Adjust property name to match your JSON
    if (!SMALL_COUNTRIES_CODES.includes(countryCode)) return null;

    const center = getCenter(feature.geometry);

    const member = memberData?.data?.members.find(
      (m) => m.alpha3 === countryCode
    );

    const style = useMemo(() => {
      const baseStyle = member ? getMemberStateStyle(member!) : defaultStateStyle;
      if (popup.visible && popup.content && popup.locked && popup.code === countryCode) {
        return { ...baseStyle, ...highlightStyle };
      }
      return baseStyle;
    }, [member]);

    const eventHandlers = getEventHandlers(
      member!,
      feature,
      popup,
      setPopup
    );

    return (
      <CircleMarker
        key={`marker-${index}`}
        center={center}
        radius={6}
        pathOptions={style}
        className="transition"
        eventHandlers={eventHandlers}
      >
      </CircleMarker>
    );
  });
};
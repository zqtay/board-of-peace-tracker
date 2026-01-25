import { useMemo, type Dispatch, type FC, type SetStateAction } from "react";
import type { MemberListData, StateGeoJson } from "../../services/data/types";
import { defaultStateStyle, getMemberStateStyle } from "./style";
import { type PopupState } from "./popup";
import { GeoJSON } from "react-leaflet";
import { getEventHandlers } from "./event";

type StatePolygonsProps = {
  geoJson: StateGeoJson;
  memberData: MemberListData;
  popup: PopupState;
  setPopup: Dispatch<SetStateAction<PopupState>>;
};

export const StatePolygons: FC<StatePolygonsProps> = ({
  geoJson, memberData, popup, setPopup
}) => {
  return geoJson.features.map((feature, index) => {
    const countryCode = feature.properties?.iso_a3_eh;
    const member = memberData?.data?.members.find(
      (m) => m.alpha3 === countryCode
    );

    const style = useMemo(() => {
      const baseStyle = member ? getMemberStateStyle(member!) : defaultStateStyle;
      return baseStyle;
    }, [member]);

    const eventHandlers = getEventHandlers(
      member!,
      feature,
      popup,
      setPopup
    );

    return (
      <GeoJSON
        key={`marker-${index}`}
        data={feature}
        style={style}
        eventHandlers={eventHandlers}
      >
      </GeoJSON>
    );
  });
};
import type { LeafletEventHandlerFnMap } from "leaflet";
import { getMemberStatePopup, type PopupState } from "./popup";
import type { Dispatch, SetStateAction } from "react";
import type { MemberState } from "../../services/data/types";
import { highlightStyle, resetStyle } from "./style";

export const getEventHandlers = (
  member: MemberState,
  feature: GeoJSON.Feature,
  popup: PopupState,
  setPopup: Dispatch<SetStateAction<PopupState>>,
) => {
  const countryCode = feature.properties?.iso_a3_eh;
  const eventHandlers: LeafletEventHandlerFnMap = {
    mouseover: (e) => {
      if (popup.locked) return;
      const l = e.target;
      l.setStyle(highlightStyle);
      setPopup({
        code: countryCode,
        content: getMemberStatePopup(member, feature, setPopup),
        visible: true,
        locked: false,
      });
    },
    mouseout: (e) => {
      if (popup.locked) return;
      const l = e.target;
      l.setStyle(resetStyle);
      setPopup({
        code: null,
        content: null,
        visible: false,
        locked: false,
      });
    },
    click: () => {
      setPopup(prev => ({
        ...prev,
        locked: true,
      }));
    }
  };
  return eventHandlers;
};
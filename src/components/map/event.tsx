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
      const l = e.target;
      l.setStyle(highlightStyle);
      if (popup.locked) return;
      setPopup({
        code: countryCode,
        content: getMemberStatePopup(member, feature, setPopup),
        visible: true,
        locked: false,
      });
    },
    mouseout: (e) => {
      if (popup.locked && popup.code === countryCode) return;
      const l = e.target;
      l.setStyle(resetStyle);
      if (popup.locked) return;
      setPopup({
        code: null,
        content: null,
        visible: false,
        locked: false,
      });
    },
    click: () => {
      setPopup(({
        code: countryCode,
        content: getMemberStatePopup(member, feature, setPopup),
        visible: true,
        locked: true,
      }));
    }
  };
  return eventHandlers;
};
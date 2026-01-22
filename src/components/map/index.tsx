import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { Layer, StyleFunction } from "leaflet";
import "leaflet/dist/leaflet.css";
import { DataService } from "../../services/data";
import { type StateGeoJson, type MemberListData } from "../../services/data/types";
import { SmallStatesMarkers } from "./marker";
import { defaultStateStyle, getMemberStateStyle } from "./style";
import { getMemberStateTooltip } from "./tooltip";

const outerBounds: [number, number][] = [
  [-90, -180], // Southwest coordinates
  [90, 180],   // Northeast coordinates
];

const Map = () => {
  const [geoJsonData, setGeoJsonData] = useState<StateGeoJson>();
  const [memberData, setMemberData] = useState<MemberListData>();

  // 1. Fetch the data when component mounts
  useEffect(() => {
    DataService.getStateGeoJson()
      .then((data) => {
        setGeoJsonData(data);
      });
    DataService.getMemberList()
      .then((data) => {
        setMemberData(data);
      });
  }, []);

  // 2. Define the styling
  const style: StyleFunction = (feature) => {
    if (!feature?.properties) {
      return defaultStateStyle;
    }
    const member = memberData?.data?.members.find(
      (m) => m.alpha3 === feature.properties?.iso_a3_eh
    );
    if (!member) {
      return defaultStateStyle;
    }
    return getMemberStateStyle(member);
  };

  // 3. Handle interactions (Hover, Popup, Click)
  const onEachState = (feature: Feature<Geometry>, layer: Layer) => {
    // A. Bind Tooltip (Hover label)
    layer.bindTooltip(() => {
      const member = memberData?.data?.members.find(
        (m) => m.alpha3 === feature.properties?.iso_a3_eh
      );
      return getMemberStateTooltip(member, feature);
    });

    // B. Handle Hover Highlighting
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 2,
          fillOpacity: 1,
        });

      },
      mouseout: (e) => {
        const l = e.target;
        // Reset to original style
        l.setStyle({
          weight: 1,
          fillOpacity: 0.7,
        });
      },
      click: (e) => {
        // Optional: Zoom to state on click
        e.target._map.fitBounds(e.target.getBounds());
      }
    });
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={3}
        maxZoom={7}
        style={{ height: "100%", width: "100%" }}
        maxBounds={outerBounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

        />
        {(geoJsonData && memberData) && (
          <GeoJSON
            data={geoJsonData}
            style={style}
            onEachFeature={onEachState}
          />
        )}
        {(geoJsonData && memberData) && <SmallStatesMarkers geoJson={geoJsonData} memberData={memberData} />}
      </MapContainer>
    </div>
  );
};

export default Map;
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { Layer, StyleFunction } from "leaflet";
import "leaflet/dist/leaflet.css";
import { DataService } from "../../services/data";
import type { MemberListData } from "../../services/data/types";

const outerBounds: [number, number][] = [
  [-90, -180], // Southwest coordinates
  [90, 180],   // Northeast coordinates
];

const Map = () => {
  const [geoJsonData, setGeoJsonData] = useState();
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
  const countryStyle: StyleFunction = (feature) => {
    if (!feature?.properties) {
      return {
        fillColor: "white", // Default gray
        fillOpacity: 0.1,
        color: "black",
        weight: 2,
      };
    }
    const isConfirmed = memberData?.data?.members.confirmed.some(
      (m) => m.alpha3 === feature.properties?.iso_a3_eh
    );
    const isInvited = memberData?.data?.members.invited.some(
      (m) => m.alpha3 === feature.properties?.iso_a3_eh
    );
    const isDeclined = memberData?.data?.members.declined.some(
      (m) => m.alpha3 === feature.properties?.iso_a3_eh
    );
    // Red for confirmed
    // Blue for declined
    // Yellow for invited
    // Gray for not involved
    const fillColor = isConfirmed ? "#dc3545"
      : isDeclined ? "#007bff"
        : isInvited ? "#ffc107"
          : "#6c757d";
    return {
      fillColor,
      fillOpacity: 0.5, // Keep this low so you can see the map behind
      color: "black",   // Border color
      weight: 2,        // Border thickness
    };
  };

  // 3. Handle interactions (Hover, Popup, Click)
  const onEachState = (feature: Feature<Geometry>, layer: Layer) => {
    // A. Bind Tooltip (Hover label)
    const countryName = feature.properties?.admin;
    layer.bindTooltip(countryName, {
      direction: "center",
      className: "country-label" // Optional CSS class
    });

    // B. Handle Hover Highlighting
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 4,
          fillOpacity: 1,
        });
        l.bringToFront(); // Ensures the border draws on top of neighbors
      },
      mouseout: (e) => {
        const l = e.target;
        // Reset to original style
        l.setStyle({
          weight: 2,
          fillOpacity: 0.5,
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
        minZoom={2}
        style={{ height: "100%", width: "100%" }}
        maxBounds={outerBounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          noWrap={true}
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={countryStyle}
            onEachFeature={onEachState}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
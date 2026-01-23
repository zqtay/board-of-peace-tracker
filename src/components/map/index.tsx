import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DataService } from "../../services/data";
import { type StateGeoJson, type MemberListData } from "../../services/data/types";
import { SmallStateMarkers } from "./marker";
import { type PopupState } from "./popup";
import { StatePolygons } from "./state";

const outerBounds: [number, number][] = [
  [-90, -180], // Southwest coordinates
  [90, 180],   // Northeast coordinates
];

const Map = () => {
  const [geoJsonData, setGeoJsonData] = useState<StateGeoJson>();
  const [memberData, setMemberData] = useState<MemberListData>();
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    content: null,
    locked: false,
  });

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
        {(geoJsonData && memberData) &&
          <StatePolygons
            geoJson={geoJsonData}
            memberData={memberData}
            popup={popup}
            setPopup={setPopup}
          />
        }
        {(geoJsonData && memberData) &&
          <SmallStateMarkers
            geoJson={geoJsonData}
            memberData={memberData}
            popup={popup}
            setPopup={setPopup}
          />
        }
      </MapContainer>
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
      <div className="card legend">
        <div><span className="legend-box confirmed"></span> Confirmed</div>
        <div><span className="legend-box invited"></span> Invited</div>
        <div><span className="legend-box declined"></span> Declined</div>
        <div><span className="legend-box not-invited"></span> Not Invited</div>
      </div>
      {popup?.visible &&
        <div className="card popup">
          {popup.content}
        </div>
      }
    </div>
  );
};

export default Map;
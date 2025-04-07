import { useState, useEffect } from "react";
import { Map, Source, Layer } from "@vis.gl/react-maplibre";
import * as turf from "@turf/turf";
import type { FillLayerSpecification, LngLatBoundsLike } from "@vis.gl/react-maplibre";
import type { FeatureCollection, BBox } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

const apiKey = import.meta.env.VITE_OS_API_KEY as string;

// const endpoints = {
//     vts: "https://api.os.uk/maps/vector/v1/vts",
//     wfs: "https://api.os.uk/features/v1/wfs",
// };

const layerStyle: FillLayerSpecification = {
    id: "polygon",
    source: "my-data",
    type: "fill",
    paint: {
        "fill-color": "#007cbf",
        "fill-outline-color": "#007cbf",
        "fill-opacity": 0.5,
    },
};

// Define the initial GeoJSON data to avoid type errors
const initialGeoJson: FeatureCollection = {
    type: "FeatureCollection",
    features: [],
};

export default function MapComponent() {
    const [data, setData] = useState<FeatureCollection>(initialGeoJson);

    useEffect(() => {
        fetch("../../data/camden-simplified.json")
            .then((response) => response.json())
            .then((jsonData) => {
                // Convert the data to GeoJSON
              const geoJsonData: FeatureCollection = {
                  type: "FeatureCollection",
                  features: jsonData.features.map((feature: { coordinates: BBox; }) => ({
                      type: "Feature",
                      geometry: {
                          type: "Polygon",
                          coordinates: feature.coordinates,
                      },
                      properties: {},
                  })),
              };
              setData(geoJsonData);
          })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);
    
    // Render a loading state while data is being fetched
    if (data.features.length === 0) {
        return <div>Loading map...</div>;
    }

    return (
        <Map
            initialViewState={{
                bounds: turf.bbox(turf.lineString([...(data.features[0].geometry as GeoJSON.Polygon).coordinates[0]])) as LngLatBoundsLike,
                fitBoundsOptions: { padding: 25, maxZoom: 12.3 },
            }}
            
            style={{ width: 1024, height: 768 }}
            mapStyle="https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Open_Greyscale.json"
            transformRequest={(url) => {
                if (url.includes("?key=")) {
                    return { url: url + "&srs=3857" };
                } else {
                    return {
                        url: url + "?key=" + apiKey + "&srs=3857",
                    };
                }
            }}
        >
            <Source id="my-data" type="geojson" data={data}>
                <Layer {...layerStyle} />
            </Source>
        </Map>
    );
}

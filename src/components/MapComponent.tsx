import { useState, useEffect } from "react";
import { Map, Source, Layer } from "@vis.gl/react-maplibre";
import * as turf from "@turf/turf";
import type {
    CircleLayerSpecification,
    FillLayerSpecification,
    LngLatBoundsLike,
} from "@vis.gl/react-maplibre";
import type { FeatureCollection, BBox } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import useCamdenRailStations from "../hooks/useCamdenRailStations";

const apiKey = import.meta.env.VITE_OS_API_KEY as string;

const boundingBoxLayerStyle: FillLayerSpecification = {
    id: "polygon",
    source: "bounding-box-data",
    type: "fill",
    paint: {
        "fill-color": "#007cbf",
        "fill-outline-color": "#007cbf",
        "fill-opacity": 0.5,
    },
};

const railstationsLayerStyle: CircleLayerSpecification = {
    id: "railstations",
    source: "rail-stations-data",
    type: "circle",
    paint: {
        "circle-color": "#ff7cbf",
        "circle-radius": 5,
        "circle-opacity": 0.8,
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
    },
};

// Define the initial GeoJSON data to avoid type errors
const initialGeoJson: FeatureCollection = {
    type: "FeatureCollection",
    features: [],
};

export default function MapComponent() {
    const [data, setData] = useState<FeatureCollection>(initialGeoJson);
    const [camdenRailStationsGeoJSON, setCamdenRailStationsGeoJSON] = useState<FeatureCollection>(initialGeoJson);

    useEffect(() => {
        fetch("../../data/camden-simplified.json")
            .then((response) => response.json())
            .then((jsonData) => {
                // Convert the data to GeoJSON
                const geoJsonData: FeatureCollection = {
                    type: "FeatureCollection",
                    features: jsonData.features.map(
                        (feature: { coordinates: BBox }) => ({
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: feature.coordinates,
                            },
                            properties: {},
                        })
                    ),
                };
                setData(geoJsonData);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, [data]);

    // Fetch the Camden rail stations GeoJSON
    useCamdenRailStations(data, apiKey, setCamdenRailStationsGeoJSON);


    // Render a loading state while data is being fetched
    if (data.features.length === 0) {
        return <div>Loading map...</div>;
    }

    return (
        <Map
            initialViewState={{
                bounds: turf.bbox(
                    turf.lineString([
                        ...(data.features[0].geometry as GeoJSON.Polygon)
                            .coordinates[0],
                    ])
                ) as LngLatBoundsLike,
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
            <Source id="bounding-box-data" type="geojson" data={data}>
                <Layer {...boundingBoxLayerStyle} />
            </Source>
            <Source
                id="rail-stations-data"
                type="geojson"
                data={camdenRailStationsGeoJSON}
            >
                <Layer {...railstationsLayerStyle} />
            </Source>
        </Map>
    );
}

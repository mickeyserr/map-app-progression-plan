import { useState, useEffect } from "react";
import { Map, Source, Layer } from "@vis.gl/react-maplibre";
import type { FillLayerSpecification } from "@vis.gl/react-maplibre";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

const config = { apikey: "QvLdYr8zRWaBkcKQWHrwX6LFXK2KsfiB" };

const endpoints = {
    vts: "https://api.os.uk/maps/vector/v1/vts",
    wfs: "https://api.os.uk/features/v1/wfs",
};

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
              const geoJsonData: FeatureCollection = {
                  type: "FeatureCollection",
                  features: jsonData.features.map((feature: { coordinates: unknown; }) => ({
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

    return (
        <Map
            initialViewState={{
                longitude: -0.13806,
                latitude: 51.54230,
                zoom: 13.5,
            }}
            style={{ width: 1024, height: 768 }}
            mapStyle="https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Open_Greyscale.json"
            transformRequest={(url) => {
                if (url.includes("?key=")) {
                    return { url: url + "&srs=3857" };
                } else {
                    return {
                        url: url + "?key=" + config.apikey + "&srs=3857",
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

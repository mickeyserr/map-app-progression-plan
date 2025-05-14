import type { FeatureCollection } from "geojson";
import { useCallback, useEffect } from "react";
import * as turf from "@turf/turf";
import { fetchCamdenRailStations } from "../util/fetchCamdenRailStations";

export default function useCamdenRailStations(data: FeatureCollection, apiKey: string, setGeoJSONData: (data: FeatureCollection) => void) {
    const fetchAndSetStations = useCallback(() => {
        if (!data || !data.features || data.features.length === 0) {
            console.error("No data available");
            return;
        }
        // Flip coordinates and create XML filter
        const flippedFeature = turf.flip(data.features[0]);
        const coordsString = (
            flippedFeature.geometry as GeoJSON.Polygon
        ).coordinates[0].join(" ");

        const xmlFilter = `
          <ogc:Filter>
            <ogc:Within>
              <ogc:PropertyName>SHAPE</ogc:PropertyName>
              <gml:Polygon srsName="EPSG:4326">
                <gml:outerBoundaryIs>
                  <gml:LinearRing>
                    <gml:coordinates>${coordsString}</gml:coordinates>
                  </gml:LinearRing>
                </gml:outerBoundaryIs>
              </gml:Polygon>
            </ogc:Within>
          </ogc:Filter>`;

        // Parameters for the API request
        const params = {
            key: apiKey,
            typeNames: "Zoomstack_RailwayStations",
            filter: xmlFilter,
            service: "WFS",
            request: "GetFeature",
            version: "2.0.0",
            outputFormat: "GEOJSON",
            count: 100,
            startIndex: 0,
        };

        fetchCamdenRailStations(params)
            .then((data) => {
                // Convert the data to GeoJSON
                const geoJsonData: FeatureCollection = {
                    type: "FeatureCollection",
                    features: data.features.map((feature) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: (feature.geometry as GeoJSON.Point)
                                .coordinates,
                        },
                        properties: feature.properties || {},
                    })),
                };
                setGeoJSONData(geoJsonData);
                // return geoJsonData;
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, [data, apiKey, setGeoJSONData]);

    useEffect(() => {
        fetchAndSetStations();
      }, [fetchAndSetStations]);
    
    return null;
}


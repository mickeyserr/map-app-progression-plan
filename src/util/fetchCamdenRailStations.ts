import type { FeatureCollection } from "geojson";

interface FetchParams {
    key: string;
    typeNames: string;
    filter: string;
    service: string;
    request: string;
    version: string;
    outputFormat: string;
    count: number;
    startIndex: number;
}

const endpoints = {
    vts: "https://api.os.uk/maps/vector/v1/vts",
    wfs: "https://api.os.uk/features/v1/wfs",
};

export async function fetchCamdenRailStations(
    params: FetchParams
): Promise<FeatureCollection> {
    let remainingResults = true;
    const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: [],
    };

    while (remainingResults) {
        const response = await fetch(getUrl(endpoints.wfs, params));
        const data = await response.json();

        geojson.features.push(...data.features);

        // If we didn't receive a full set of results, we've fetched all matching features
        remainingResults = data.features.length < params.count ? false : true;
        // If we received a full set of results, increment the startIndex
        params.startIndex += params.count;
    }

    return geojson;
}

function getUrl(wfs: string, params: FetchParams): string {
    const searchParams = new URLSearchParams();

    // Add all params to the URL search parameters
    Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
    });

    return `${wfs}?${searchParams.toString()}`;
}
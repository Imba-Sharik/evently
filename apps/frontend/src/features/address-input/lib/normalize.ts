import type { SearchBoxFeatureSuggestion } from "@mapbox/search-js-core";
import type { AddressValue } from "../model/types";

export function normalizeMapboxFeature(feature: SearchBoxFeatureSuggestion): AddressValue {
  const { longitude, latitude } = feature.properties.coordinates;

  const featureType = feature.properties.feature_type ?? "";
  const isCity = featureType === "place";

  return {
    provider: "mapbox",
    feature_type: featureType,
    place_id:      isCity ? "" : feature.properties.mapbox_id,
    city_place_id: feature.properties.context?.place?.id ?? (isCity ? feature.properties.mapbox_id : ""),
    lat: latitude,
    lng: longitude,
    name: feature.properties.name ?? "",
    city_name: feature.properties.context?.place?.name ?? (isCity ? (feature.properties.name ?? "") : ""),
    country_code: feature.properties.context?.country?.country_code?.toLowerCase() ?? "",
  };
}

"use client";

import { SearchBox } from "@mapbox/search-js-react";
import type { SearchBoxRetrieveResponse } from "@mapbox/search-js-core";
import { normalizeMapboxFeature } from "../lib/normalize";
import type { AddressInputProps } from "../model/types";
import { AddressMap } from "./AddressMap";

const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

export function AddressInput({
  accessToken,
  value,
  onChange,
  onClear,
  mapStyle = DEFAULT_MAP_STYLE,
  placeholder,
  types = "address,place,locality,district",
  language,
  className,
  mapClassName = "h-48 w-full rounded-lg overflow-hidden",
}: AddressInputProps) {
  const lang = language ?? (typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en");

  function handleRetrieve(res: SearchBoxRetrieveResponse) {
    const feature = res.features[0];
    if (!feature) return;
    onChange(normalizeMapboxFeature(feature));
  }

  return (
    <div className={`flex flex-col gap-4${className ? ` ${className}` : ""}`}>
      <SearchBox
        accessToken={accessToken}
        options={{ types, language: lang }}
        onRetrieve={handleRetrieve}
        onClear={onClear}
        placeholder={placeholder}
        theme={{
          variables: {
            fontFamily: "inherit",
            unit: "14px",
            borderRadius: "8px",
          },
        }}
      />

      <div style={{ marginTop: "12px" }}>
        <AddressMap
          accessToken={accessToken}
          lat={value?.lat}
          lng={value?.lng}
          showMarker={value?.feature_type === "address"}
          featureType={value?.feature_type}
          language={lang}
          mapStyle={mapStyle}
          className={mapClassName}
        />
      </div>
    </div>
  );
}

export interface AddressValue {
  provider: "mapbox";
  /** "address" | "place" | "locality" | "district" | "region" | "country" */
  feature_type: string;
  /** ID адреса. Пуст если выбран только город */
  place_id: string;
  /** ID города — для фильтрации по городу на бэке */
  city_place_id: string;
  lat: number;
  lng: number;
  /** Короткое название: "проспект Ленина, 1" или "Якутск" */
  name: string;
  /** Название города на языке автора: "Якутск" */
  city_name: string;
  country_code: string;
}

export interface AddressInputProps {
  accessToken: string;
  value?: AddressValue;
  onChange: (value: AddressValue) => void;
  onClear?: () => void;
  mapStyle?: string;
  placeholder?: string;
  /** Mapbox result types. Default: "address,place,locality,district" */
  types?: string;
  /** Язык результатов. Default: берётся из navigator.language */
  language?: string;
  className?: string;
  mapClassName?: string;
}

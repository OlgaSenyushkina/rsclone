import { LatLngBounds, LatLngExpression, Map } from 'leaflet';
import { AircraftsMap } from './';

export interface FlightsLayerState {
  supressRequest: boolean,
  aircrafts: AircraftsMap,
  mapBounds: LatLngBounds,
  trackLatLngs: LatLngExpression[],
  trackShowingAircraft: string,
}

export interface TrackLayerUpdaterProps {
  latLngs: LatLngExpression[],
}

export interface FlightLayerUpdaterProps {
  updateMapBounds: (map: Map) => void,
  showFavoritiesTacks: () => void,
}

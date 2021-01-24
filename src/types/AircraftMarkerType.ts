import { LatLngExpression, LeafletMouseEvent } from 'leaflet';

export interface AircraftMarkerProps {
  position: LatLngExpression,
  altitude: number,
  trackAngle: number,
  callsign: string,
  aircraftType: string,
  withTrack: boolean,
  onIconClick: (event: LeafletMouseEvent) => void,
}

import { useState } from 'react';
import L, {
  LatLng,
  latLng,
  Marker,
} from 'leaflet';
import { useMap } from 'react-leaflet';
import { AirportType } from '../../types/AirportsLayerType';
import { roundCoordinates } from '../../utils/apiUtils';
import { AIRPORT_BLUE_PIN_HTML } from '../../utils/constants';
import 'leaflet-contextmenu';
import { ContextMenuMap, ExtendedMarkerOptions } from 'leaflet-contextmenu';

function showCoordinates(coord: LatLng, marker: Marker) {
  marker.bindPopup(`<p>Latitude: ${coord.lat}</p><p>Longitude: ${coord.lng}</p>`).openPopup();
}

function fetchAirports(
  version: number,
  setAirports: (arr: AirportType[]) => void,
  setVersion: (version: number) => void,
): void {
  const fetchStr = '/api/allAirports';

  fetch(fetchStr, { method: 'GET' })
    .then((resp) => resp.json())
    .then((json) => {
      if (!json) {
        return;
      }
      if (json.version > version) {
        setAirports([...json.rows]);
        setVersion(json.version);
      }
    });
}

export default function FuncAirportsLayer(): JSX.Element {
  const [version, setVersion] = useState(0);
  const [airports, setAirports] = useState([]);
  const map: ContextMenuMap = useMap() as ContextMenuMap;

  Object.assign(map.options, { contextmenu: true });
  map.on('click', () => {
    if (map.contextmenu.isVisible()) {
      map.contextmenu.hide();
    }
  });

  fetchAirports(version, setAirports, setVersion);

  airports.forEach((airport: AirportType) => {
    const longitude: number = roundCoordinates(airport.lon);
    const latitude: number = roundCoordinates(airport.lat);
    const icon = L.divIcon({
      html: AIRPORT_BLUE_PIN_HTML,
      iconSize: [20, 20],
      iconAnchor: [20, 20],
    });

    const marker: Marker = L.marker([latitude, longitude], {
      icon,
      contextmenu: true,
      contextmenuInheritItems: false,
      contextmenuItems: [
        {
          text: 'Show coordinates',
          callback: () => showCoordinates(latLng(latitude, longitude), marker),
        },
        '-',
        {
          text: 'Departures',
          // TODO callback: showDepartures
        }, {
          text: 'Arrivals',
          // TODO callback: showArrivals
        },
      ],
    } as ExtendedMarkerOptions).addTo(map);
  });

  return null;
}

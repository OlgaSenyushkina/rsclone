import { useState } from 'react';
import L, { Map, MarkerOptions } from 'leaflet';
import { useMap } from 'react-leaflet';
import { AirportType } from '../../types/AirportsLayerType';
import { roundCoordinates } from '../../utils/apiUtils';

interface ExtendedMarkerOptions extends MarkerOptions {
  contextmenu: boolean,
  contextmenuItems: ({
    text: string,
    icon?: string,
    callback?: () => void,
  } | string )[]
}
export default function FuncAirportsLayer(): JSX.Element {
  const [version, setVersion] = useState(0);
  const [airports, setAirports] = useState([]);
  const map: Map = useMap();

  fetchAirports(version, setAirports, setVersion);

  airports.forEach((airport: AirportType) => {
    const longitude: number = roundCoordinates(airport.lon);
    const latitude: number = roundCoordinates(airport.lat);
    const icon = L.divIcon({
      html: '<img src="../../img/airport_pin_40_blue.png" style="height:20px;width:20px;position:absolute;">',
      iconSize: [20, 20],
      iconAnchor: [20, 20],
    });

    L.marker([latitude, longitude], {
      icon: icon,
      contextmenu: true,
      contextmenuItems: [{
          text: 'Show coordinates',
          // callback: showCoordinates
      }, {
          text: 'Center map here',
          // callback: centerMap
      }, '-', {
          text: 'Zoom in',
          icon: 'images/zoom-in.png',
          // callback: zoomIn
      }, {
          text: 'Zoom out',
          icon: 'images/zoom-out.png',
          // callback: zoomOut
      }]
    } as ExtendedMarkerOptions).addTo(map);
  });

  return null;
}

function fetchAirports(version: number, setAirports: (arr: AirportType[]) => void, setVersion: (version: number) => void): void {
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
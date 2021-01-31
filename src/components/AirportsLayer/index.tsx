import React, { Component, ComponentPropsWithoutRef } from 'react';
import { Marker } from 'react-leaflet';
import L, { PointExpression } from 'leaflet';
import { AirportsLayerState, AirportType } from '../../types/AirportsLayerType';
import { roundCoordinates } from '../../utils/apiUtils';
import { ICON_ANCHOR_SIZE, ICON_SIZE } from '../../utils/constants';

class AirportsLayer extends Component<ComponentPropsWithoutRef<'object'>, AirportsLayerState> {
  constructor(props: ComponentPropsWithoutRef<'object'>) {
    super(props);
    this.state = {
      airportsMap: {
        version: 0,
        airports: [],
      },
    };
  }

  componentDidMount(): void {
    this.getAirports();
  }

  getAirports(): void {
    const fetchStr = '/api/allAirports';

    fetch(fetchStr, { method: 'GET' })
      .then((resp) => resp.json())
      .then((json) => {
        if (!json) {
          return;
        }
        const { airportsMap } = this.state;

        const newState = { airportsMap };

        if (airportsMap) {
          if (json.version > airportsMap.version) {
            // should update to fresh version
            Object.assign(newState, {
              airportsMap: {
                version: json.version,
                airports: [...json.rows],
              },
            });
          }
        }

        this.setState(newState);
      });
  }

  getMarkers(): JSX.Element[] {
    const { airportsMap } = this.state;

    return airportsMap.airports.map((airport: AirportType) => {
      const longitude: number = roundCoordinates(airport.lon);
      const latitude: number = roundCoordinates(airport.lat);
      const icon = L.divIcon({
        html: '<img src="../../img/airport_pin_40_blue.png" style="height:20px;width:20px;position:absolute;">',
        iconSize: ICON_SIZE as PointExpression,
        iconAnchor: ICON_ANCHOR_SIZE as PointExpression,
      });
      return (
        <Marker
          key={airport.iata}
          icon={icon}
          position={[latitude, longitude]}
          zIndexOffset={airport.alt}
        />
      );
    });
  }

  render(): JSX.Element {
    const markers = this.getMarkers();
    return (
      <>
        {markers}
      </>
    );
  }
}
export default AirportsLayer;

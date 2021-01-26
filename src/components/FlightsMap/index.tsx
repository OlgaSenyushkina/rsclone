import React, {
  Component,
  ComponentPropsWithoutRef,
} from 'react';
import { Map } from 'leaflet';
import {
  MapContainer,
  TileLayer,
} from 'react-leaflet';
import FlightsLayer from '../../components/FlightsLayer';
import AirportsLayer from '../AirportsLayer';
import FuncAirportsLayer from '../FuncAirportsLayer';
import { FlightMapState } from '../../types/FlightsMapType';
import { getMapURL } from '../../utils/apiUtils';
import { EURASIAN_CENTER, mapZoom } from '../../utils/constants';
import './index.scss';

class FlightsMap extends Component<ComponentPropsWithoutRef<'object'>, FlightMapState> {
  setCurrentUserLocation: (map: Map) => void;

  constructor(props: ComponentPropsWithoutRef<'object'>) {
    super(props);
    this.state = {
      geoPosition: EURASIAN_CENTER,
    };
    this.setCurrentUserLocation = (map: Map) => map.locate({ setView: true, maxZoom: mapZoom });
  }

  render(): JSX.Element {
    const { geoPosition } = this.state;
    return (
      <MapContainer
        center={geoPosition}
        zoom={mapZoom}
        scrollWheelZoom
        whenCreated={this.setCurrentUserLocation}
      >
        <TileLayer
          url={getMapURL()}
        />
        <FlightsLayer />
        <FuncAirportsLayer />
      </MapContainer>
    );
  }
}

export default FlightsMap;

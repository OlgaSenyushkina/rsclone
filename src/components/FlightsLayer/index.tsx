import React, { Component, ComponentPropsWithoutRef } from 'react';
import { Polyline } from 'react-leaflet';
import { Map } from 'leaflet';
import { FlightsLayerState } from '../../types/FlightsLayerType';
import FlightLayerUpdater from './FlightsLayerUpdater';
import { AircraftPosition, AircraftState } from '../../types';
import AircraftMarker from './AircraftMarker';
import {
  joinTracks,
  roundCoordinates,
  trackCoordinates,
} from '../../utils/apiUtils';
import './index.scss';

class FlightsLayer extends Component<ComponentPropsWithoutRef<'object'>, FlightsLayerState> {
  timerId: NodeJS.Timeout;

  angleStep: number;

  constructor(props: ComponentPropsWithoutRef<'object'>) {
    super(props);
    this.state = {
      suppressRequest: false,
      aircrafts: {},
      mapBounds: null,
      trackLatLngs: {},
      trackShowingAircrafts: [],
    };
    this.angleStep = 15;
  }

  componentDidMount(): void {
    this.timerId = setInterval(
      () => this.getAircrafts(),
      3000,
    );
  }

  componentWillUnmount(): void {
    clearInterval(this.timerId);
  }

  getAircrafts(): void {
    const { mapBounds } = this.state;
    if (!mapBounds) {
      return;
    }

    const nw = mapBounds.getNorthWest();
    const se = mapBounds.getSouthEast();

    const fetchStr = `/api/flights?bounds=${nw.lat},${se.lat},${nw.lng},${se.lng}`;
    fetch(fetchStr, { method: 'GET', mode: 'no-cors' })
      .then((resp) => resp.json())
      .then((json) => {
        if (!json) {
          return;
        }
        const { aircrafts: aircraftMap, trackShowingAircrafts, trackLatLngs } = this.state;
        let latLngs = { ...trackLatLngs };
        const newAircraftsMap = { ...aircraftMap };

        const filteredResponseKeys = Object.keys(json).filter((key) => !['full_count', 'version'].includes(key));
        if (!filteredResponseKeys) {
          return;
        }
        filteredResponseKeys.forEach((flightId: string) => {
          const stateArr = json[flightId];

          const aircraftState: AircraftState = {
            icao24: stateArr[0],
            currentPosition: {
              latitude: stateArr[1],
              longitude: stateArr[2],
              true_track: stateArr[3],
              altitude: stateArr[4],
              velocity: stateArr[5],
              time_position: stateArr[10],
            },
            aircraft_type: stateArr[8],
            registration: stateArr[9],
            airport_from: stateArr[11],
            airport_to: stateArr[12],
            callsign: stateArr[13],
            positions: [],
          };
          const currentAircraftState = newAircraftsMap[flightId];
          if (!currentAircraftState) {
            const positions: AircraftPosition[] = [];
            positions.unshift({
              latitude: stateArr[1],
              longitude: stateArr[2],
              true_track: stateArr[3],
              altitude: stateArr[4],
              velocity: stateArr[5],
              time_position: stateArr[10],
            });
            Object.assign(aircraftState, { positions });
            newAircraftsMap[flightId] = aircraftState;
          } else {
            const { positions } = currentAircraftState;
            Object.assign(currentAircraftState, aircraftState);
            positions.unshift({
              latitude: stateArr[1],
              longitude: stateArr[2],
              true_track: stateArr[3],
              altitude: stateArr[4],
              velocity: stateArr[5],
              time_position: stateArr[10],
            });
            positions.sort((pos1, pos2) => pos2.time_position - pos1.time_position);
            Object.assign(currentAircraftState, { positions });
            if (trackShowingAircrafts.includes(flightId)) {
              latLngs[flightId] = trackCoordinates(aircraftMap[flightId].positions);
            }
          }
        });

        this.setState({ aircrafts: newAircraftsMap, trackLatLngs: latLngs });
      });
  }

  getMarkers(): JSX.Element[] {
    const { aircrafts, trackShowingAircrafts } = this.state;

    return Object.entries(aircrafts).map(([flightId, aircraft]) => {
      const longitude = roundCoordinates(aircraft.positions[0].longitude
        || aircraft.currentPosition.longitude);
      const latitude = roundCoordinates(aircraft.positions[0].latitude
        || aircraft.currentPosition.latitude);
      return (
        <AircraftMarker
          key={flightId}
          position={[latitude, longitude]}
          altitude={aircraft.positions[0].altitude}
          trackAngle={aircraft.positions[0].true_track}
          callsign={aircraft.callsign}
          aircraftType={aircraft.aircraft_type}
          withTrack={trackShowingAircrafts.includes(flightId)}
          onIconClick={(event) => this.aircraftIconClickHandler(
            flightId,
            event.originalEvent.ctrlKey,
          )}
        />
      );
    });
  }

  getTracks(): JSX.Element[] {
    const { trackLatLngs } = this.state;

    return Object.entries(trackLatLngs).map(([flightId, track]) => (<Polyline
      key={flightId}
      positions={track}
      pathOptions={{ color: 'lime' }}
    />));
  }

  aircraftIconClickHandler = (flightId: string, append: boolean): void => {
    const { trackShowingAircrafts } = this.state;
    if (trackShowingAircrafts.includes(flightId)) {
      this.hideTrack(flightId);
    } else {
      this.showTrack(flightId, append);
    }
  };

  showTrack(flightId: string, append: boolean): void {
    const { trackShowingAircrafts } = this.state;
    if (!trackShowingAircrafts.includes(flightId)) {
      const fetchStr = `/api/flightStatus?flightId=${flightId}`;
      fetch(fetchStr, { method: 'GET', mode: 'no-cors' })
        .then((resp) => resp.json())
        .then((json) => {
          const historicTrail = json.trail.map((itm: {
            lat: number,
            lng: number,
            alt: number,
            spd: number,
            ts: number,
            hd: number
          }) => ({
            longitude: itm.lng,
            latitude: itm.lat,
            true_track: itm.hd,
            altitude: itm.alt,
            velocity: itm.spd,
            time_position: itm.ts,
          }));

          this.revealTrack(flightId, true, append, historicTrail);
        });
    }
    this.revealTrack(flightId, false, append, []);
  }

  toggleSuppressRequest = (): void => this.setState((state) => ({
    suppressRequest: !state.suppressRequest,
  }));

  updateMapBounds = (map: Map): void => {
    const { suppressRequest } = this.state;
    if (suppressRequest) {
      return;
    }

    setTimeout(() => this.toggleSuppressRequest(), 5000);

    this.setState((state) => {
      if (state.mapBounds === null
        || !map.getBounds().equals(state.mapBounds)) {
        return {
          suppressRequest: true,
          mapBounds: map.getBounds(),
        };
      }
      return {
        suppressRequest: true,
        mapBounds: state.mapBounds,
      };
    });
  };

  hideTrack = (flightId: string): void => {
    this.setState((state) => {
      const { trackLatLngs, trackShowingAircrafts } = state;

      const flightIndex = trackShowingAircrafts.indexOf(flightId);

      delete trackLatLngs[flightId];
      trackShowingAircrafts.splice(flightIndex, 1);
      return { trackLatLngs, trackShowingAircrafts };
    });
  };

  revealTrack = (
    flightId: string,
    needUpdateTrack: boolean,
    append: boolean,
    historicTrail: AircraftPosition[],
  ): void => {
    this.setState((state) => {
      const { aircrafts } = state;
      let { trackLatLngs, trackShowingAircrafts } = state;

      const aircraft: AircraftState = aircrafts[flightId];

      const joinedTracks = needUpdateTrack ? joinTracks(aircraft.positions, historicTrail)
        : aircraft.positions;

      if (needUpdateTrack) {
        aircraft.positions = joinedTracks;
      }

      const latLngs = trackCoordinates(joinedTracks);

      if (append) {
        if (!trackShowingAircrafts.includes(flightId) && append) {
          trackShowingAircrafts.push(flightId);
          trackLatLngs[flightId] = latLngs;
        }
      } else {
        trackShowingAircrafts = Array.of(flightId);
        trackLatLngs = { [flightId]: latLngs };
      }

      return { trackLatLngs, trackShowingAircrafts };
    });
  };

  render(): JSX.Element {
    const markers = this.getMarkers();
    const tracks = this.getTracks();
    return (
      <>
        <FlightLayerUpdater
          updateMapBounds={this.updateMapBounds}
          showFavoritiesTacks={() => { /* TODO */ }}
        />
        {markers}
        {tracks}
      </>
    );
  }
}

export default FlightsLayer;

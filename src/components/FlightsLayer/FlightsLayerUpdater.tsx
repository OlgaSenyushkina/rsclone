import { LeafletKeyboardEvent } from 'leaflet';
import {
  useMapEvents,
} from 'react-leaflet';
import { FlightLayerUpdaterProps } from '../../types/FlightsLayerType';
import { CTLR_MAP_PAN_INTERVAL } from '../../utils/constants';

export default function FlightLayerUpdater({ updateMapBounds, showFavoritiesTacks }:
FlightLayerUpdaterProps): JSX.Element {
  const map = useMapEvents({
    moveend: () => updateMapBounds(map),
    keyup: (event: LeafletKeyboardEvent) => {
      const { originalEvent } = event;
      if (originalEvent.ctrlKey) {
        switch (originalEvent.code) {
          case 'ArrowUp':
            map.panBy([0, -1 * CTLR_MAP_PAN_INTERVAL]);
            break;
          case 'ArrowDown':
            map.panBy([0, CTLR_MAP_PAN_INTERVAL]);
            break;
          case 'ArrowLeft':
            map.panBy([-1 * CTLR_MAP_PAN_INTERVAL, 0]);
            break;
          case 'ArrowRight':
            map.panBy([CTLR_MAP_PAN_INTERVAL, 0]);
            break;
          case 'KeyT':
            // TODO
            showFavoritiesTacks();
            break;
          default: break;
        }
      }
    },
  });
  return null;
}

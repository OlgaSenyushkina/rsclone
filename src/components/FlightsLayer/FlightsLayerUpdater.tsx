import { LeafletKeyboardEvent } from 'leaflet';
import {
  useMapEvents,
} from 'react-leaflet';
import { FlightLayerUpdaterProps } from '../../types/FlightsLayerType';

export default function FlightLayerUpdater({ updateMapBounds, showFavoritiesTacks }:
FlightLayerUpdaterProps): JSX.Element {
  const map = useMapEvents({
    moveend: () => updateMapBounds(map),
    keyup: (event: LeafletKeyboardEvent) => {
      const { originalEvent } = event;
      if (originalEvent.ctrlKey) {
        switch (originalEvent.code) {
          case 'ArrowUp':
            map.panBy([0, -800]);
            break;
          case 'ArrowDown':
            map.panBy([0, 800]);
            break;
          case 'ArrowLeft':
            map.panBy([-800, 0]);
            break;
          case 'ArrowRight':
            map.panBy([800, 0]);
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

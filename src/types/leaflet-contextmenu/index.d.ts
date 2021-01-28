declare module 'leaflet-contextmenu' {
  import { Map, MarkerOptions } from "leaflet";
  
  export interface ContextMenuMap extends Map {
    contextmenu: {
      isVisible: () => boolean,
      hide: () => void,
    },
  }

  export interface ExtendedMarkerOptions extends MarkerOptions {
    contextmenu: boolean,
    contextmenuItems: ({
      text: string,
      icon?: string,
      callback?: () => void,
    } | string)[]
  }
}

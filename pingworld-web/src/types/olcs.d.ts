declare module "olcs/OLCesium" {
  import Map from "ol/Map";

  export default class OLCesium {
    constructor(options: { map: Map });
    setEnabled(enabled: boolean): void;
    getEnabled(): boolean;
    enableAutoRenderLoop(): void;
    getCesiumScene(): any;
  }
}

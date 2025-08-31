declare interface Window {
  BMap: typeof BMap;
  BMapGL: typeof BMapGL;
  initBaiduMap?: () => void;
}

declare namespace BMapGL {
  // GL版本的类定义与普通版本类似，但使用GL命名空间
  class Map {
    constructor(container: string | HTMLElement);
    centerAndZoom(center: Point, zoom: number): void;
    enableScrollWheelZoom(enable: boolean): void;
    addOverlay(overlay: Overlay): void;
    addControl(control: any): void;
    destroy(): void;
    getZoom(): number;
    setZoom(zoom: number): void;
    addEventListener(event: string, callback: Function): void;
  }

  class Point {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
  }

  class Marker {
    constructor(point: Point);
    getPosition(): Point;
  }

  class Label {
    constructor(content: string, opts?: LabelOptions);
    setPosition(position: Point): void;
    setStyle(style: object): void;
  }

  interface LabelOptions {
    position?: Point;
    offset?: Size;
  }

  class Size {
    constructor(width: number, height: number);
  }

  interface Overlay {}

  // 路线规划相关
  class DrivingRoute {
    constructor(map: Map, opts?: DrivingRouteOptions);
    search(start: Point, end: Point): void;
    setSearchCompleteCallback(callback: (result: any) => void): void;
  }

  interface DrivingRouteOptions {
    renderOptions?: {
      map: Map;
      autoViewport?: boolean;
      enableDragging?: boolean;
    };
    onSearchComplete?: (result: any) => void;
  }

  class TransitRoute {
    constructor(map: Map, opts?: TransitRouteOptions);
    search(start: Point, end: Point): void;
    setSearchCompleteCallback(callback: (result: any) => void): void;
  }

  interface TransitRouteOptions {
    renderOptions?: {
      map: Map;
      autoViewport?: boolean;
    };
    onSearchComplete?: (result: any) => void;
  }

  class WalkingRoute {
    constructor(map: Map, opts?: WalkingRouteOptions);
    search(start: Point, end: Point): void;
    setSearchCompleteCallback(callback: (result: any) => void): void;
  }

  interface WalkingRouteOptions {
    renderOptions?: {
      map: Map;
      autoViewport?: boolean;
    };
    onSearchComplete?: (result: any) => void;
  }

  // 控件相关
  class NavigationControl {
    constructor(options?: NavigationControlOptions);
  }

  interface NavigationControlOptions {
    anchor?: number;
    type?: number;
    offset?: Size;
    showZoomInfo?: boolean;
    enableGeolocation?: boolean;
  }

  class ZoomControl {
    constructor(options?: ZoomControlOptions);
  }

  interface ZoomControlOptions {
    anchor?: number;
    offset?: Size;
  }

  class NavigationControl3D {
    constructor(options?: NavigationControl3DOptions);
  }

  interface NavigationControl3DOptions {
    anchor?: number;
    offset?: Size;
  }

  class ScaleControl {
    constructor(options?: ScaleControlOptions);
  }

  interface ScaleControlOptions {
    anchor?: number;
    offset?: Size;
  }

  class CopyrightControl {
    constructor(options?: CopyrightControlOptions);
  }

  interface CopyrightControlOptions {
    anchor?: number;
    offset?: Size;
  }

  // 控件常量
  const BMAP_ANCHOR_TOP_LEFT: number;
  const BMAP_ANCHOR_TOP_RIGHT: number;
  const BMAP_ANCHOR_BOTTOM_LEFT: number;
  const BMAP_ANCHOR_BOTTOM_RIGHT: number;
  
  const BMAP_NAVIGATION_CONTROL_LARGE: number;
  const BMAP_NAVIGATION_CONTROL_SMALL: number;
  const BMAP_NAVIGATION_CONTROL_PAN: number;
  const BMAP_NAVIGATION_CONTROL_ZOOM: number;
  const BMAP_NAVIGATION_CONTROL_MAP: number;
}

declare namespace BMap {
  class Map {
    constructor(container: string | HTMLElement);
    centerAndZoom(center: Point, zoom: number): void;
    enableScrollWheelZoom(enable: boolean): void;
    addOverlay(overlay: Overlay): void;
    addControl(control: any): void;
    destroy(): void;
    getZoom(): number;
    setZoom(zoom: number): void;
    addEventListener(event: string, callback: Function): void;
  }

  class Point {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
  }

  class Marker {
    constructor(point: Point);
    getPosition(): Point;
  }

  class Label {
    constructor(content: string, opts?: LabelOptions);
    setPosition(position: Point): void;
    setStyle(style: object): void;
  }

  interface LabelOptions {
    position?: Point;
    offset?: Size;
  }

  class Size {
    constructor(width: number, height: number);
  }

  interface Overlay {}

  class DrivingRoute {
    constructor(map: Map, opts?: DrivingRouteOptions);
    search(start: Point, end: Point): void;
    setSearchCompleteCallback(callback: (result: any) => void): void;
  }

  interface DrivingRouteOptions {
    renderOptions?: {
      map: Map;
      autoViewport?: boolean;
      enableDragging?: boolean;
    };
    onSearchComplete?: (result: any) => void;
    onPolylinesSet?: (routes: any) => void;
    onMarkersSet?: (markers: any) => void;
  }

  class TransitRoute {
    constructor(map: Map, opts?: TransitRouteOptions);
    search(start: Point, end: Point): void;
    setSearchCompleteCallback(callback: (result: any) => void): void;
  }

  interface TransitRouteOptions {
    renderOptions?: {
      map: Map;
      autoViewport?: boolean;
    };
    onSearchComplete?: (result: any) => void;
  }

  class WalkingRoute {
    constructor(map: Map, opts?: WalkingRouteOptions);
    search(start: Point, end: Point): void;
    setSearchCompleteCallback(callback: (result: any) => void): void;
  }

  interface WalkingRouteOptions {
    renderOptions?: {
      map: Map;
      autoViewport?: boolean;
    };
    onSearchComplete?: (result: any) => void;
  }

  // 控件相关
  class NavigationControl {
    constructor(options?: NavigationControlOptions);
  }

  interface NavigationControlOptions {
    anchor?: number;
    type?: number;
    offset?: Size;
    showZoomInfo?: boolean;
    enableGeolocation?: boolean;
  }

  class ScaleControl {
    constructor(options?: ScaleControlOptions);
  }

  interface ScaleControlOptions {
    anchor?: number;
    offset?: Size;
  }

  class CopyrightControl {
    constructor(options?: CopyrightControlOptions);
  }

  interface CopyrightControlOptions {
    anchor?: number;
    offset?: Size;
  }

  // 控件常量
  const BMAP_ANCHOR_TOP_LEFT: number;
  const BMAP_ANCHOR_TOP_RIGHT: number;
  const BMAP_ANCHOR_BOTTOM_LEFT: number;
  const BMAP_ANCHOR_BOTTOM_RIGHT: number;
  
  const BMAP_NAVIGATION_CONTROL_LARGE: number;
  const BMAP_NAVIGATION_CONTROL_SMALL: number;
  const BMAP_NAVIGATION_CONTROL_PAN: number;
  const BMAP_NAVIGATION_CONTROL_ZOOM: number;
  const BMAP_NAVIGATION_CONTROL_MAP: number;
}

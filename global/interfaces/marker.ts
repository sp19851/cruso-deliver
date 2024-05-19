type Marker = IRootObject

interface IRootObject {
    Marker: IMarker;
}

interface IMarker {
  Type: string;
  Scale: IScale;
  Color: IRGB;
  Dist:number;
}

interface IScale {
  x: number;
  y: number;
  z: number;
  
}
interface IRGB {
    r: number;
    g: number;
    b: number;
    
  }

export {Marker}
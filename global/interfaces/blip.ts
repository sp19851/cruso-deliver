type Blip = IRootObject

interface IRootObject {
  Blip: IBlip;
}

interface IBlip {
  Position: IPosition;
  Name: string;
  Sprite: number;
  Color: number;
  Scale: number;
}

interface IPosition {
  x: number;
  y: number;
  z: number;
  w: number;
}

export {Blip}
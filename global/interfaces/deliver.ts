import {Blip} from '../interfaces/blip'
import {Orders} from '../interfaces/order'
type Deliver = IRootObject

interface IRootObject {
  Office: IOffice;
  Orders:Orders
}

interface IOffice {
  Ped: string;
  PedPosition: IPedPosition;
  PedScenario: string;
  Vehicle: string;
  VehiclePosition: IVehiclePosition;
  Blip:Blip,
}

interface IPedPosition {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface IVehiclePosition {
  x: number;
  y: number;
  z: number;
  w: number;
}

export {Deliver}
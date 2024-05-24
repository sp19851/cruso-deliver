import {Blip} from '../interfaces/blip'
import {Marker} from '../interfaces/marker'
import {Orders} from '../interfaces/order'
type Deliver = IRootObject

interface IRootObject {
  Office: IOffice;
  Marker: Marker;
  Orders: Orders;
}

interface IOffice {
  Ped: string;
  PedPosition: IPedPosition;
  PedScenario: string;
  TargetLabelManager:string;
  TargetLabelManagerDone:string;
  TargetIcon:string;
  Vehicle: string;
  VehicleDeposit: number;
  VehiclePosition: IVehiclePosition;
  VehicleCredit: number,
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
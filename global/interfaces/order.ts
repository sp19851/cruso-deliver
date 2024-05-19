type Orders = IRootObject

interface IRootObject {
  Orders: IOrder[];
}

interface IOrder {
  TargetPosTake: ITargetPos;
  TargetPosTakePed: ITargetPos;
  PedTake: string;
  TargetPos: ITargetPos;
  TargetPosPed: ITargetPos;
  Ped: string;
  PedScenario: string;
  Price: number;
  Item: string;
}

interface ITargetPos {
  x: number;
  y: number;
  z: number;
  w: number;
}

export {Orders}
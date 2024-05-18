const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import * as Cfx from "fivem-js";

let QBCore = global.exports['qb-core'].GetCoreObject();

onNet("cruso-deliver:server:GiveOrder",(item:string) => {
     let src = source
     let Player = QBCore.Functions.GetPlayer(src) 
    // Player.Functions.AddItem(item, 1)
     emitNet("cruso-deliver:client:GiveOrder", source)
    }
);

onNet("cruso-deliver:server:RemoveOrderItem",(item:string, price:number) => {
    let src = source
    let Player = QBCore.Functions.GetPlayer(src) 
    Player.Functions.RemoveItem(item, 1)
    Player.Functions.AddMoney("cash", price, "takeOrder")
    emitNet("cruso-deliver:client:TakeOrder", source)
    }
);
  
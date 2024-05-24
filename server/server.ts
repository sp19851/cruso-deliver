const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import * as Cfx from "fivem-js";

let QBCore = global.exports['qb-core'].GetCoreObject();

onNet("cruso-deliver:server:TakeOrder", (itemName:string) => {
     let src = source
     let Player = QBCore.Functions.GetPlayer(src) 
    
     Player.Functions.AddItem(itemName, 1)
     emitNet("cruso-deliver:client:TakeOrder", source)
    }
);

onNet("cruso-deliver:server:RemoveOrderItem",(item:string, price:number) => {
    let src = source
    let Player = QBCore.Functions.GetPlayer(src) 
    Player.Functions.RemoveItem(item, 1)
    Player.Functions.AddMoney("cash", price, "takeOrder")
    emitNet("cruso-deliver:client:GenerateOrder", source)
    }
);

onNet("cruso-deliver:server:RemoveDeposit",(price:number) => {
    let src = source
    let Player = QBCore.Functions.GetPlayer(src) 
    if (Player.PlayerData.money['bank']>= price){
        Player.Functions.RemoveMoney("bank", price, "takeOrder")
    }
    else if (Player.PlayerData.money['cash']>= price)  {
        Player.Functions.RemoveMoney("cash", price, "takeOrder")
    }
    }
);
onNet("cruso-deliver:server:ReturnDeposit",(price:number) => {
    let src = source
    let Player = QBCore.Functions.GetPlayer(src) 
    Player.Functions.AddMoney("bank", price, "takeOrder")
    }
);

QBCore.Functions.CreateCallback('cruso:server:CanPay', (source:number, cb:any, price:number) => {
    console.log('cruso:server:CanPay', source, price)
    let Player = QBCore.Functions.GetPlayer(source)
    console.log(Player.PlayerData.money['bank'], Player.PlayerData.money['cash'])
    cb(Player.PlayerData.money['bank']>= price || Player.PlayerData.money['cash']>= price);
})
    


  
"use strict";(()=>{var s=global.exports["qb-core"].GetCoreObject();onNet("cruso-deliver:server:GiveOrder",e=>{let r=source;s.Functions.GetPlayer(r).Functions.AddItem(e,1),emitNet("cruso-deliver:client:GiveOrder",source)});onNet("cruso-deliver:server:RemoveOrderItem",(e,r)=>{let t=source,o=s.Functions.GetPlayer(t);o.Functions.RemoveItem(e,1),o.Functions.AddMoney("cash",r,"takeOrder"),emitNet("cruso-deliver:client:TakeOrder",source)});})();

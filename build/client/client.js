"use strict";(()=>{var n=o=>new Promise(e=>setTimeout(e,o));RegisterCommand("sv",async(o,e,c)=>{let[r]=e,t=GetHashKey(r);if(!IsModelAVehicle(t))return;for(RequestModel(t);!HasModelLoaded;)await n(100);let[a,i,d]=GetEntityCoords(PlayerPedId(),!0),l=GetEntityHeading(PlayerPedId()),s=CreateVehicle(t,a,i,d,l,!0,!0);for(;!DoesEntityExist(s);)await n(100);SetPedIntoVehicle(PlayerPedId(),s,-1)},!1);})();

const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import {Prop}  from "fivem-js";
import * as Cfx from "fivem-js";



export async function BlipCreate(pos:Cfx.Vector3, radius: number, name: string, sprite: number, color: number, scale:number): Promise<Cfx.Blip>{
    let blip = Cfx.World.createBlip(pos, radius);
    blip.Sprite = sprite;
    blip.Color = color;
    //blip.Scale = scale;
    SetBlipScale(blip.Handle, scale);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentSubstringPlayerName(name);
    EndTextCommandSetBlipName(blip.Handle);
    console.log("blip created", JSON.stringify(blip))
    return blip;
}

export function blipCreate(pos:Cfx.Vector3, name: string, sprite: number, color: number, scale:number): number{
   
    let blip = AddBlipForCoord(pos.x, pos.y, pos.z)
    SetBlipSprite(blip, sprite);
    SetBlipColour(blip, color);
    SetBlipScale(blip, scale);
    SetBlipDisplay(blip, 4);
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentSubstringPlayerName(name);
    EndTextCommandSetBlipName(blip);
    console.log("blip created", JSON.stringify(blip))
    return blip;
}

export async function LoadModel(hash:number){
    if (!IsModelInCdimage(hash))
        {
            console.error(`model ${hash} invalid`);
            return;
        }
    RequestModel(hash);
    while(!HasModelLoaded(hash)) await Delay(100);
}

export async function LoadAnimDict(animdict:string){
    RequestAnimDict(animdict);
    while(!HasAnimDictLoaded(animdict)) await Delay(100);
}

export async function PlayAnimationWithProp(animDict: string, anim:string, prop:string){
    if (IsEntityPlayingAnim(Cfx.Game.PlayerPed.Handle, animDict, anim, 50))
        {
            ClearPedTasks(Cfx.Game.PlayerPed.Handle);
        }
        RequestAnimDict(animDict);
        while (!HasAnimDictLoaded(animDict)) await Delay(100);
        TaskPlayAnim(Cfx.Game.PlayerPed.Handle, animDict, anim, 8, 1, -1, 50, 0, false, false, false);
}
export async function PlayPedAnimationWithProp(ped: number, animDict: string, anim:string, prop:string){
    if (IsEntityPlayingAnim(ped, animDict, anim, 50))
        {
            ClearPedTasks(ped);
        }
        RequestAnimDict(animDict);
        while (!HasAnimDictLoaded(animDict)) await Delay(100);
        TaskPlayAnim(ped, animDict, anim, 8, 1, -1, 50, 0, false, false, false);
}
export async function StopAnimWithProp(ped:number, prop: Prop, animDict: string, anim:string){
    
    prop.delete();
    while (prop.exists()) await Delay(100);
    StopAnimTask(ped, animDict, anim, -4);
    
}

export async function PedCreate(model:Cfx.Model, pos:Cfx.Vector3, heading:number):Promise<Cfx.Ped>
{
    let ped = Cfx.World.createPed(model, pos, heading);
    console.log("ped created", JSON.stringify(ped))
    return ped;
}

export async function pedCreate(model:string, pos:Cfx.Vector3, heading:number, scenario:string):Promise<number>
{
    
    var hash = GetHashKey(model);
    await LoadModel(hash);
    var handle = CreatePed(4, hash, pos.x, pos.y, pos.z - 0.98, heading, false, true);
    PlaceObjectOnGroundProperly(handle);
    FreezeEntityPosition(handle, true);
    SetEntityInvincible(handle, true);
    SetBlockingOfNonTemporaryEvents(handle, true);
    TaskStartScenarioInPlace(handle, scenario, -1, true);
    
    console.log("ped created", handle)
    return handle;
}


export const RandNum = function(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const GetVehicleBonePos = function(vehicle: number, bone: string): Cfx.Vector3 {
    //console.log("GetVehicleBonePos", vehicle, bone)
    var _bone = GetEntityBoneIndexByName(vehicle, bone);
    if (_bone == -1) {
        var _bone = GetEntityBoneIndexByName(vehicle, "door_dside_f");
    }
    var pos = GetWorldPositionOfEntityBone(vehicle, _bone)
    //console.log("GetVehicleBonePos", _bone, pos)
    return new Cfx.Vector3(pos[0], pos[1], pos[2]);
}
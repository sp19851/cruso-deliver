const Delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
import { Vector3 } from 'fivem-js';
import { cfg } from '../global/config'
import { deliver } from '../global/getDeliverConfig'
import * as Cfx from "fivem-js";
import * as Utils from '../client/utils'
import { Orders } from '../global/interfaces/order';
import {onRoute} from '../global/classes/onRoute'

//Variables
let mainBlip: number = 0;
let routeBlip: number = 0;
let currentVehicle: number = 0;
let inMission: boolean = false;

/*let onRoute: boolean = false;
let onRoute:object = {
	onRoute : false,
	itemInVehicle: false,
	onRouteInOrderKeeper: false
} */

let _onRoute = new onRoute();

let inMissionTick: number = 0;
//let onRouteTick: number = 0;
let income: number = 0;
let fine: number = 0;
let currentOrder: any = null;
let props: Array<Cfx.Prop> = new Array<Cfx.Prop>();
let Peds: Array<number> = new Array<number>();

//получаем данные QBCore
let QBCore = global.exports['qb-core'].GetCoreObject();

//Events
//Слушаем событие начала миссии от target
on("cruso-deliver:client:startMission", async (args: any) => {
	if (!inMission) {
		QBCore.Functions.SpawnVehicle(deliver.Office.Vehicle, (v: number) => {
			currentVehicle = v;
			SetVehicleNumberPlateText(v, "POST" + Utils.RandNum(1111, 2222).toString())
			SetEntityHeading(v, deliver.Office.VehiclePosition.w)
			SetVehicleFuelLevel(v, 100.0)
			DecorSetFloat(v, "_FUEL_LEVEL", GetVehicleFuelLevel(v))
			//TaskWarpPedIntoVehicle(PlayerPedId(), v, -1)
			emit("vehiclekeys:client:SetOwner", GetVehicleNumberPlateText(v))
			SetVehicleEngineOn(v, true, true, false)
		}, deliver.Office.VehiclePosition, true)
		QBCore.Functions.Notify('Вы начали работать. Проверьте автомобиль и ожидайте заказ', 'primary', 5000)
		await StartMission();
	}
	else {
		FinishMission();
	}
})
//Слушаем событие взятия заказа от target
/*on("cruso-deliver:client:TakeOrder", async (args: any) => {
	console.log("cruso-deliver:client:TakeOrder")
	_onRoute.onRoute = true;
	QBCore.Functions.Progressbar('TakeOrder', "Забираем заказ", 500, false, false, {
		disableMovement: true,
		disableCarMovement: true,
		disableMouse: false,
		disableCombat: true,
	}, {

	}, {

	}, {}, function Done()
	{
		//console.log("try server call")
		emitNet("cruso-deliver:server:TakeOrder", currentOrder.Item);
	}, // Done
	() => {	console.error("сбой")	} //  Cancel
	)
})*/
//Слушаем событие взятия заказа от сервера
onNet("cruso-deliver:client:TakeOrder", async (args: any) => {
	TakeOrder();
})

/*//Слушаем событие взятия заказа от сервера
onNet("cruso-deliver:client:TakeOrder", async (args: any) => {
	clearTick(onRouteTick);
	
	QBCore.Functions.Notify('Вы успешно завершили работу', 'success', 5000);
	await Delay(15000);
})
*/


//инициализируем программу
const init = setTick(async () => {
	await Delay(1000)
	let v3 = new Vector3(deliver.Office.Blip.Position.x, deliver.Office.Blip.Position.y, deliver.Office.Blip.Position.z);
	mainBlip = Utils.blipCreate(v3, deliver.Office.Blip.Name, deliver.Office.Blip.Sprite, deliver.Office.Blip.Color, deliver.Office.Blip.Scale);
	v3 = new Vector3(deliver.Office.PedPosition.x, deliver.Office.PedPosition.y, deliver.Office.PedPosition.z);
	let ped = await Utils.pedCreate(deliver.Office.Ped, v3, deliver.Office.PedPosition.w, deliver.Office.PedScenario);
	global.exports['qb-target'].AddTargetEntity(ped, {
		options: [
			//начинаем работать
			{
				label: deliver.Office.TargetLabelManager,
				icon: deliver.Office.TargetIcon,
				event: 'cruso-deliver:client:startMission',
				args: {
					index: 0,
					cash: 0
				},
				canInteract: () => {return  !inMission},
			},
			//заканчиваем работать
			{
				label: deliver.Office.TargetLabelManagerDone,
				icon: deliver.Office.TargetIcon,
				event: 'cruso-deliver:client:startMission', 
				args: {
					index: 0,
					cash: 0
				},
				canInteract: () => {return  inMission && !_onRoute.onRoute},
			},
			/*{
				label: deliver.Office.TargetLabelGetItems,
				icon: deliver.Office.TargetIconGetItems,
				canInteract: () => {return  inMission && !_onRoute.onRoute},
				event: 'cruso-deliver:client:getOrder',
			}*/
		],
		distance: 2.5,
	});
	await Delay(1000)
	stopThisTick()

})


//основной цикл
const onRouteTick = setTick(async () => {
	if (_onRoute.onRoute)
	{
		if (!_onRoute.itemInVehicle && !_onRoute.onRouteInOrderKeeper)
		{
				
				if (props.length == 0) {
					let _pos = new Vector3(Cfx.Game.PlayerPed.Position.x, Cfx.Game.PlayerPed.Position.y, Cfx.Game.PlayerPed.Position.z + 0.5);
					var prop = await Cfx.World.createProp(new Cfx.Model('hei_prop_heist_box'), _pos, false, true);
					props.push(prop);
					await Utils.PlayAnimationWithProp("anim@heists@box_carry@", 'idle', 'hei_prop_heist_box');
					AttachEntityToEntity(prop.Handle, Cfx.Game.PlayerPed.Handle, GetPedBoneIndex(Cfx.Game.PlayerPed.Handle, 28422), 0, 0, 0, 0, 0, 0, true, true, false, true, 1, true);
				}
				
				Cfx.Screen.displayHelpTextThisFrame(`Положите коробку в машину и следуйте к месту доставки`);
				let posAr = GetEntityForwardVector(currentVehicle);
				let posV = new Vector3(posAr[0], posAr[1], posAr[2]).multiply(5);
				let pos = Utils.GetVehicleBonePos(currentVehicle, "boot");
				//pos = Vector3.subtract(pos, posV);
				Cfx.World.drawMarker(Cfx.MarkerType.DebugSphere, pos, new Vector3(0,0,0), new Vector3(0,0,0), new Vector3(deliver.Marker.Scale.x,deliver.Marker.Scale.y,deliver.Marker.Scale.z), 
					Cfx.Color.fromArgb(255, deliver.Marker.Color.r, deliver.Marker.Color.g, deliver.Marker.Color.b));
				let dist = Cfx.Game.PlayerPed.Position.distance(pos);
				//console.log("dst", dist, "pos", JSON.stringify(pos), "ped", JSON.stringify(Cfx.Game.PlayerPed.Position) )
				if (dist < 2.5) {
					global.exports['qb-core'].DrawText("[E] - Убрать в машину", 'left')
					if (IsControlJustPressed(0, 38))
					{
						_onRoute.itemInVehicle = true;
						global.exports['qb-core'].HideText()
						var targetPos = new Vector3(currentOrder.TargetPos.x, currentOrder.TargetPos.y, currentOrder.TargetPos.z)
						SetPointRoute(new Vector3(currentOrder.TargetPos.x, currentOrder.TargetPos.y, currentOrder.TargetPos.z));
						QBCore.Functions.Progressbar('getOrder', "Убираем заказ", 500, false, false, {
							disableMovement: true,
							disableCarMovement: true,
							disableMouse: false,
							disableCombat: true,
						}, {
							/*animDict: 'anim@heists@box_carry@',
							anim: 'idle',
							flags: 50,*/
						}, {
							/*model: 'hei_prop_heist_box',
							bone: 28422,
							coords: { "x": 0.0, "y": 0.00, "z": 0.00 },
							rotation: { "x": 0.0, "y": 0.0, "z": 0.0 },*/
						}, {}, async function Done()
						{
							await Utils.StopAnimWithProp(Cfx.Game.PlayerPed.Handle, props[0], 'anim@heists@box_carry@', 'idle');
							props.splice(0, props.length);
						}, // Done
						() => {	console.error("сбой")	} //  Cancel
						)
					} 
				}
				else 
				{
					global.exports['qb-core'].HideText()
				}
		} else if (_onRoute.itemInVehicle)
		{
			Cfx.Screen.displayHelpTextThisFrame(`Cледуйте к месту доставки`);
			let dist = Cfx.Vehicle.fromHandle(currentVehicle).Position.distance(currentOrder.TargetPos)
			if (dist <= deliver.Marker.Dist) {
				Cfx.World.drawMarker(Cfx.MarkerType.DebugSphere, new Vector3(currentOrder.TargetPos.x, currentOrder.TargetPos.y, currentOrder.TargetPos.z-1), new Vector3(0,0,0), new Vector3(0,0,0), new Vector3(3,3,deliver.Marker.Scale.z), 
					Cfx.Color.fromArgb(255, deliver.Marker.Color.r, deliver.Marker.Color.g, deliver.Marker.Color.b));
			}
			if (dist < 5 && GetEntitySpeed(currentVehicle) == 0) {
				Cfx.Screen.displayHelpTextThisFrame(`Достаньте заказ и машины и отнесите заказчику`);
				let posAr = GetEntityForwardVector(currentVehicle);
				let posV = new Vector3(posAr[0], posAr[1], posAr[2]).multiply(5);
				let pos = Utils.GetVehicleBonePos(currentVehicle, "boot");
				//pos = Vector3.subtract(pos, posV);
				if (!Cfx.Game.PlayerPed.isInAnyVehicle()) {
					Cfx.World.drawMarker(deliver.Marker.Type, pos, new Vector3(0,0,0), new Vector3(0,0,0), new Vector3(deliver.Marker.Scale.x,deliver.Marker.Scale.y,deliver.Marker.Scale.z), 
					Cfx.Color.fromArgb(255, deliver.Marker.Color.r, deliver.Marker.Color.g, deliver.Marker.Color.b));
					let distToBoot = Cfx.Game.PlayerPed.Position.distance(pos);
					if (dist < 2) {
						global.exports['qb-core'].DrawText("[E] - Достать из машины", 'left')
						if (IsControlJustPressed(0, 38))
						{
							_onRoute.itemInVehicle = true;
							global.exports['qb-core'].HideText()
							var targetPos = new Vector3(currentOrder.TargetPos.x, currentOrder.TargetPos.y, currentOrder.TargetPos.z)
							SetBlipRoute(routeBlip,false);
							RemoveBlip(routeBlip);
							routeBlip = 0;
							QBCore.Functions.Progressbar('getOrder', "Достаем заказ", 500, false, false, {
								disableMovement: true,
								disableCarMovement: true,
								disableMouse: false,
								disableCombat: true,
							}, {
								/*animDict: 'anim@heists@box_carry@',
								anim: 'idle',
								flags: 50,*/
							}, {
								/*model: 'hei_prop_heist_box',
								bone: 28422,
								coords: { "x": 0.0, "y": 0.00, "z": 0.00 },
								rotation: { "x": 0.0, "y": 0.0, "z": 0.0 },*/
							}, {}, async function Done()
							{
								//console.log("props.length", props.length)
								if (props.length == 0) {
									let _pos = new Vector3(Cfx.Game.PlayerPed.Position.x, Cfx.Game.PlayerPed.Position.y, Cfx.Game.PlayerPed.Position.z + 0.5);
									var prop = await Cfx.World.createProp(new Cfx.Model('hei_prop_heist_box'), _pos, false, true);
									props.push(prop);
									await Utils.PlayAnimationWithProp("anim@heists@box_carry@", 'idle', 'hei_prop_heist_box');
									AttachEntityToEntity(prop.Handle, Cfx.Game.PlayerPed.Handle, GetPedBoneIndex(Cfx.Game.PlayerPed.Handle, 28422), 0, 0, 0, 0, 0, 0, true, true, false, true, 1, true);
									
								}
								_onRoute.itemInVehicle =false;
								_onRoute.onRouteInOrderKeeper = true;
								
							}, // Done
							() => {	console.error("сбой")	} //  Cancel
							)
						} 
					}
				}
				
			}
		} else if (!_onRoute.itemInVehicle && _onRoute.onRouteInOrderKeeper)
			{
				Cfx.Screen.displayHelpTextThisFrame(`Cледуйте к заказчику`);
				
				let dist = Cfx.Game.PlayerPed.Position.distance(currentOrder.TargetPosPed)
				//console.log("dist", dist)
				if (dist < 15) {
					Cfx.World.drawMarker(deliver.Marker.Type, new Vector3(currentOrder.TargetPosPed.x, currentOrder.TargetPosPed.y, currentOrder.TargetPosPed.z-1), new Vector3(0,0,0), new Vector3(0,0,0), new Vector3(deliver.Marker.Scale.x,deliver.Marker.Scale.y,deliver.Marker.Scale.z), 
					Cfx.Color.fromArgb(255, deliver.Marker.Color.r, deliver.Marker.Color.g, deliver.Marker.Color.b));
				}
				if (dist < 2) {
					global.exports['qb-core'].DrawText("[E] - Постучать", 'left')
						if (IsControlJustPressed(0, 38))
						{
							_onRoute.toReset();
							global.exports['qb-core'].HideText()
							SetBlipRoute(routeBlip,false);
							RemoveBlip(routeBlip);
							routeBlip = 0;
							GiveOrder();
						}
				}
		}
	}
	else if (_onRoute.isOrder && !_onRoute.onRouteInOrderGiver){
		Cfx.Screen.displayHelpTextThisFrame(`Получен заказ, следуйте к отмеченной точке`);
		let pos = new Vector3(currentOrder.TargetPosTake.x, currentOrder.TargetPosTake.y, currentOrder.TargetPosTake.z - 0.98);
		let dist = Cfx.Game.PlayerPed.Position.distance(pos);
		if (dist <= deliver.Marker.Dist) {
			Cfx.World.drawMarker(deliver.Marker.Type, pos, new Vector3(0,0,0), new Vector3(0,0,0), new Vector3(3, 3, deliver.Marker.Scale.z), 
			Cfx.Color.fromArgb(255, deliver.Marker.Color.r, deliver.Marker.Color.g, deliver.Marker.Color.b));
		}
		if (dist < 5 && GetEntitySpeed(currentVehicle) == 0) {
			Cfx.Screen.displayHelpTextThisFrame(`Выйдите из машины и подойдите к отправителю`);
			let posAr = GetEntityForwardVector(currentVehicle);
			let posV = new Vector3(posAr[0], posAr[1], posAr[2]).multiply(5);
			let pos = Utils.GetVehicleBonePos(currentVehicle, "boot");
			//pos = Vector3.subtract(pos, posV);
			if (!Cfx.Game.PlayerPed.isInAnyVehicle()) {
				_onRoute.onRouteInOrderGiver = true;
				SetPointRoute(new Vector3(currentOrder.TargetPosTakePed.x, currentOrder.TargetPosTakePed.y, currentOrder.TargetPosTakePed.z));
			}
		}
	}
	else if (_onRoute.isOrder && _onRoute.onRouteInOrderGiver)
	{
		Cfx.Screen.displayHelpTextThisFrame(`Cледуйте к отправителю`);
		let dist = Cfx.Game.PlayerPed.Position.distance(currentOrder.TargetPosTakePed)
		if (dist < 15) {
			Cfx.World.drawMarker(deliver.Marker.Type, new Vector3(currentOrder.TargetPosTakePed.x, currentOrder.TargetPosTakePed.y, currentOrder.TargetPosTakePed.z-1), new Vector3(0,0,0), new Vector3(0,0,0), new Vector3(deliver.Marker.Scale.x,deliver.Marker.Scale.y,deliver.Marker.Scale.z), 
			Cfx.Color.fromArgb(255, deliver.Marker.Color.r, deliver.Marker.Color.g, deliver.Marker.Color.b));
		}
	}
});


//останавливаем инициизирущий тик
function stopThisTick() {
	clearTick(init);
}
//Начинаем миссию
async function  StartMission(){
	inMission = true;
	GenerateOrder();
	/*inMissionTick = setTick(async () => {
		if (!_onRoute.onRoute) 
		{
			if (!_onRoute.isOrder) {
				await Delay(Utils.RandNum(15000, 25000));
				GenerateOrder();
				_onRoute.isOrder = true;
				//Cfx.Screen.displayHelpTextThisFrame(`Заказ готов. Подойдите к менеджеру и заберите его`);

			}
			else {
				Cfx.Screen.displayHelpTextThisFrame(`Заказ готов. Подойдите к менеджеру и заберите его`);
			}
		}
		else {
			await Delay(1000)
		}
	});*/
}
//Заканчиваем миссию
async function  FinishMission(){
	QBCore.Functions.Notify('Вы завершили работу', 'error', 5000)
	inMission = false;
	Reset();
	
}

//Генерируем заказ
async function  GenerateOrder(){
	currentOrder = deliver.Orders[Utils.RandNum(0, deliver.Orders.length-1)];
	_onRoute.isOrder = true
	SetPointRoute(new Vector3(currentOrder.TargetPosTake.x, currentOrder.TargetPosTake.y, currentOrder.TargetPosTake.z))
	TakeOrderPrepare();
}

async function SetPointRoute(coords: Vector3)
{
	SetBlipRoute(routeBlip, false);
	RemoveBlip(routeBlip);
	routeBlip = 0;
	if (routeBlip == 0) {
		routeBlip = AddBlipForCoord(coords.x,coords.y,coords.z);
		SetBlipRoute(routeBlip, true);
		SetBlipRouteColour(routeBlip, 5);
	}
}

//Забираем заказ - подготовка
async function TakeOrderPrepare()
{
	let ped = await Utils.pedCreate(currentOrder.PedTake, new Vector3(currentOrder.TargetPosTakePed.x, currentOrder.TargetPosTakePed.y, currentOrder.TargetPosTakePed.z), currentOrder.TargetPosTakePed.w, deliver.Office.PedScenario);
	Peds.push(ped);
	global.exports['qb-target'].AddTargetEntity(ped, {
		options: [
			//начинаем работать
			{
				label: deliver.Office.TargetLabelGetItems,
				icon: deliver.Office.TargetIconGetItems,
				/*type : "server",
				event: 'cruso-deliver:server:TakeOrder',
				args: {
					item: currentOrder.Item
				},*/
				action: ()=>
					{
						console.log("БИНГО");
						emitNet("cruso-deliver:server:TakeOrder", currentOrder.Item)

					},
				canInteract: () => {return  _onRoute.isOrder},
			},
			
		],
		distance: 2.5,
	});
}


//Забираем заказ
async function  TakeOrder(){
	/*const knockAnimLib = "timetable@jimmy@doorknock@";
    const knockAnim = "knockdoor_idle";
	await Utils.LoadAnimDict(knockAnimLib);
	TriggerServerEvent("InteractSound_SV:PlayOnSource", "knock_door", 0.2)
	TaskPlayAnim(Cfx.Game.PlayerPed.Handle, knockAnimLib, knockAnim, 3.0, 3.0, -1, 1, 0, false, false, false)
    await Delay(3500)
	TaskPlayAnim(Cfx.Game.PlayerPed.Handle, knockAnimLib, "exit", 3.0, 3.0, -1, 1, 0, false, false, false)*/
	
	QBCore.Functions.Progressbar('getOrder', "Получаем заказ", 5000, false, false, {
		disableMovement: true,
		disableCarMovement: true,
		disableMouse: false,
		disableCombat: true,
	}, {
		/*animDict: 'anim@heists@box_carry@',
		anim: 'idle',
		flags: 50,*/
	}, {
		/*model: 'hei_prop_heist_box',
		bone: 28422,
		coords: { "x": 0.0, "y": 0.00, "z": 0.00 },
		rotation: { "x": 0.0, "y": 0.0, "z": 0.0 },*/
	}, {}, async function Done()
	{
		if (props.length == 0) {
			let _pos = Cfx.Game.PlayerPed.Position;
			var prop = await Cfx.World.createProp(new Cfx.Model('hei_prop_heist_box'), _pos, false, true);
			props.push(prop);
			await Utils.PlayPedAnimationWithProp(Cfx.Game.PlayerPed.Handle, "anim@heists@box_carry@", 'idle', 'hei_prop_heist_box');
			AttachEntityToEntity(prop.Handle, Cfx.Game.PlayerPed.Handle, GetPedBoneIndex(Cfx.Game.PlayerPed.Handle, 28422), 0, 0, 0, 0, 0, 0, true, true, false, true, 1, true);
			
		}
		/*var pos = GetEntityCoords(currentVehicle, true);
		await SetPointRoute(new Vector3(pos[0], pos[1], pos[2]));
		_onRoute.isOrder = false;*/
		emitNet("cruso-deliver:server:GiveOrder", currentOrder.Item)
	}, // Done
	() => {	console.error("сбой")	} //  Cancel
	)
}

//Отдаем заказ
async function  GiveOrder(){
	const knockAnimLib = "timetable@jimmy@doorknock@";
    const knockAnim = "knockdoor_idle";
	await Utils.LoadAnimDict(knockAnimLib);
	TriggerServerEvent("InteractSound_SV:PlayOnSource", "knock_door", 0.2)
	TaskPlayAnim(Cfx.Game.PlayerPed.Handle, knockAnimLib, knockAnim, 3.0, 3.0, -1, 1, 0, false, false, false)
    await Delay(3500)
	TaskPlayAnim(Cfx.Game.PlayerPed.Handle, knockAnimLib, "exit", 3.0, 3.0, -1, 1, 0, false, false, false)
	let ped = await Utils.pedCreate(currentOrder.Ped, new Vector3(currentOrder.TargetPosPed.x, currentOrder.TargetPosPed.y, currentOrder.TargetPosPed.z), currentOrder.TargetPosPed.w, deliver.Office.PedScenario);
	QBCore.Functions.Progressbar('getOrder', "Передаем заказ", 5000, false, false, {
		disableMovement: true,
		disableCarMovement: true,
		disableMouse: false,
		disableCombat: true,
	}, {
		/*animDict: 'anim@heists@box_carry@',
		anim: 'idle',
		flags: 50,*/
	}, {
		/*model: 'hei_prop_heist_box',
		bone: 28422,
		coords: { "x": 0.0, "y": 0.00, "z": 0.00 },
		rotation: { "x": 0.0, "y": 0.0, "z": 0.0 },*/
	}, {}, async function Done()
	{
		await Utils.StopAnimWithProp(Cfx.Game.PlayerPed.Handle, props[0], 'anim@heists@box_carry@', 'idle');
		props.splice(0, props.length);

		if (props.length == 0) {
			let _pos = GetEntityCoords(ped, true);
			var prop = await Cfx.World.createProp(new Cfx.Model('hei_prop_heist_box'), new Vector3(_pos[0], _pos[1], _pos[2]), false, true);
			props.push(prop);
			await Utils.PlayPedAnimationWithProp(ped, "anim@heists@box_carry@", 'idle', 'hei_prop_heist_box');
			AttachEntityToEntity(prop.Handle, ped, GetPedBoneIndex(ped, 28422), 0, 0, 0, 0, 0, 0, true, true, false, true, 1, true);
			
		}
		await Delay(5000);
		await Utils.StopAnimWithProp(ped,props[0], 'anim@heists@box_carry@', 'idle');
		props.splice(0, props.length);
		DeleteEntity(ped)
		_onRoute.isOrder = false;
		emitNet("cruso-deliver:server:RemoveOrderItem", currentOrder.Item, currentOrder.Price)
	}, // Done
	() => {	console.error("сбой")	} //  Cancel
	)
}

//обновляем данные
function Reset(): void {
	clearTick(inMissionTick);
	clearTick(onRouteTick);
	
	if (DoesEntityExist(currentVehicle)){
		DeleteEntity(currentVehicle);
		currentVehicle = 0
	}
	inMission = false;
	
	_onRoute.toReset();
	props.forEach(prop=>{
		prop.delete();
	});	
	props.splice(0, props.length);
	RemoveBlip(routeBlip);
	routeBlip = 0;
}

on("onResourceStop", (resource: string) => {
	if (resource == GetCurrentResourceName()) {
		RemoveBlip(mainBlip);
		mainBlip = 0;
		Reset();
	}
});



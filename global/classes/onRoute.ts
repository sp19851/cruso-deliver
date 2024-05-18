export class onRoute {
	isOrder : boolean;
    onRoute : boolean;
	itemInVehicle : boolean;
	onRouteInOrderKeeper: boolean;


    constructor() {
        this.isOrder = false;
        this.onRoute = false;
        this.itemInVehicle = false;
        this.onRouteInOrderKeeper = false;
    }

    toReset(){
        this.isOrder = false;
        this.onRoute = false;
        this.itemInVehicle = false;
        this.onRouteInOrderKeeper = false;
    }
} 


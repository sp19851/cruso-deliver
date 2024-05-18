const configPath = "config/deliver.json";
const rawData = LoadResourceFile(GetCurrentResourceName(), configPath);

import {Deliver} from '../global/interfaces/deliver'

let deliver:any;

if (rawData !== null) {
    try {
        const _deliver: Deliver = JSON.parse(rawData);
        deliver = _deliver;
    }
    catch (error) {
        console.error('error parsing file')
    }
}
else {
    console.error(`error reading file ${GetCurrentResourceName()} ${rawData}`)
}

export {deliver}
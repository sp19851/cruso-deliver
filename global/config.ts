const configPath = "config.json";
const rawData = LoadResourceFile(GetCurrentResourceName(), configPath);

interface Config {
    message: string;
}

let cfg:any;

if (rawData !== null) {
    try {
        const config: Config = JSON.parse(rawData);
        cfg = config;
    }
    catch (error) {
        console.error('error parsing file')
    }
}
else {
    console.error('error reading file')
}

export {cfg}
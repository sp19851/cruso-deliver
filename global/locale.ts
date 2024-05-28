const localePath = "locale.json";
const rawData = LoadResourceFile(GetCurrentResourceName(), localePath);

interface Locale {
    message: string;
}

let locale:any;

if (rawData !== null) {
    try {
        const config: Locale = JSON.parse(rawData);
        locale = config;
    }
    catch (error) {
        console.error('error parsing file')
    }
}
else {
    console.error('error reading file')
}

export {locale}
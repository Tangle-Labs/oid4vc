const camelToSnakeCase = (str) => {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
};
const stringifyNestedObject = (obj) => {
    return encodeURIComponent(JSON.stringify(camelToSnakeCaseRecursive(obj)));
};
export const camelToSnakeCaseRecursive = (input) => {
    if (input === null || typeof input !== "object") {
        return input;
    }
    if (Array.isArray(input)) {
        return input.map(camelToSnakeCaseRecursive);
    }
    return Object.keys(input).reduce((acc, key) => {
        const snakeKey = camelToSnakeCase(key);
        acc[snakeKey] = camelToSnakeCaseRecursive(input[key]);
        return acc;
    }, {});
};
export const objectToQueryString = (json) => {
    return ("?" +
        Object.keys(json)
            .map((key) => {
            const snakeKey = camelToSnakeCase(key);
            const value = typeof json[key] === "object"
                ? stringifyNestedObject(json[key])
                : json[key];
            return `${encodeURIComponent(snakeKey)}=${value}`;
        })
            .join("&"));
};
const snakeToCamelCase = (str) => {
    return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
};
const parseJsonValue = (value, convertToCameCase) => {
    try {
        const parsedValue = JSON.parse(value);
        if (typeof parsedValue === "object" && parsedValue !== null) {
            return parseJsonKeys(parsedValue, convertToCameCase);
        }
        else {
            return parsedValue;
        }
    }
    catch (error) {
        return value;
    }
};
const parseJsonKeys = (json, convertToCameCase) => {
    const result = {};
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            const camelKey = convertToCameCase ? snakeToCamelCase(key) : key;
            const value = parseJsonValue(json[key], convertToCameCase);
            result[camelKey] = value;
        }
    }
    return result;
};
export const parseQueryStringToJson = (queryString) => {
    const urlParams = new URLSearchParams(queryString);
    const json = {};
    for (const [key, value] of urlParams.entries()) {
        const camelKey = snakeToCamelCase(decodeURIComponent(key));
        json[camelKey] = parseJsonValue(decodeURIComponent(value), key === "client_metadata");
    }
    return json;
};
//# sourceMappingURL=query.js.map
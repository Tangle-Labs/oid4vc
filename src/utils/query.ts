const camelToSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
};

const stringifyNestedObject = (obj: any): string => {
    return encodeURIComponent(JSON.stringify(camelToSnakeCaseRecursive(obj)));
};

export const camelToSnakeCaseRecursive = (input: any): any => {
    if (input === null || typeof input !== "object") {
        return input;
    }

    if (Array.isArray(input)) {
        return input.map(camelToSnakeCaseRecursive);
    }

    return Object.keys(input).reduce(
        (acc: Record<string, any>, key: string) => {
            const snakeKey = camelToSnakeCase(key);
            acc[snakeKey] = camelToSnakeCaseRecursive(input[key]);
            return acc;
        },
        {}
    );
};

export const objectToSnakeCaseQueryString = (
    json: Record<string, any>
): string => {
    return (
        "?" +
        Object.keys(json)
            .map((key) => {
                const snakeKey = camelToSnakeCase(key);
                const value =
                    typeof json[key] === "object"
                        ? stringifyNestedObject(json[key])
                        : json[key];
                return `${encodeURIComponent(snakeKey)}=${value}`;
            })
            .join("&")
    );
};

const snakeToCamelCase = (str: string): string => {
    return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
};

const parseJsonValue = (value: string, convertToCameCase: boolean): any => {
    try {
        const parsedValue = JSON.parse(value);
        if (typeof parsedValue === "object" && parsedValue !== null) {
            return parseJsonKeys(parsedValue, convertToCameCase);
        } else {
            return parsedValue;
        }
    } catch (error) {
        return value;
    }
};

const parseJsonKeys = (
    json: Record<string, string>,
    convertToCameCase: boolean
): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            const camelKey = convertToCameCase ? snakeToCamelCase(key) : key;
            const value = parseJsonValue(json[key], convertToCameCase);
            result[camelKey] = value;
        }
    }
    return result;
};

export const parseQueryStringToJson = (
    queryString: string
): Record<string, any> => {
    const urlParams = new URLSearchParams(queryString);
    const json: Record<string, any> = {};

    for (const [key, value] of urlParams.entries()) {
        const camelKey = snakeToCamelCase(decodeURIComponent(key));
        json[camelKey] = parseJsonValue(
            decodeURIComponent(value),
            key === "client_metadata"
        );
    }

    return json;
};

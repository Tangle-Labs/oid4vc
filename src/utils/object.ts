const ignoreTransformList = [
    "presentation_definition",
    "grants",
    "credential_configurations_supported",
];

export function camelToSnakeRecursive(
    input: Record<string, any>
): Record<string, any> {
    if (Array.isArray(input)) {
        return input.map((item) => camelToSnakeRecursive(item));
    } else if (typeof input === "object" && input !== null) {
        const output: { [key: string]: any } = {};

        for (const key in input) {
            if (Object.prototype.hasOwnProperty.call(input, key)) {
                const snakeKey = key.replace(
                    /[A-Z]/g,
                    (match) => "_" + match.toLowerCase()
                );
                output[snakeKey] = camelToSnakeRecursive(input[key]);
            }
        }

        return output;
    } else {
        return input;
    }
}

export function snakeToCamelRecursive(
    input: Record<string, any>
): Record<string, any> {
    if (Array.isArray(input)) {
        return input.map((item) => snakeToCamelRecursive(item));
    } else if (typeof input === "object" && input !== null) {
        const output: { [key: string]: any } = {};

        for (const key in input) {
            if (Object.prototype.hasOwnProperty.call(input, key)) {
                const camelKey = key.replace(/_([a-z])/g, (match, letter) =>
                    letter.toUpperCase()
                );

                if (ignoreTransformList.includes(key)) {
                    output[camelKey] = input[key];
                } else {
                    output[camelKey] = snakeToCamelRecursive(input[key]);
                }
            }
        }

        return output;
    } else {
        return input;
    }
}

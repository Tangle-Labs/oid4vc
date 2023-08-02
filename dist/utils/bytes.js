import { Buffer } from "buffer";
export const bytesToString = (bytes) => {
    return Buffer.from(bytes).toString("hex");
};
export const stringToBytes = (str) => {
    return Uint8Array.from(Buffer.from(str, "hex"));
};
//# sourceMappingURL=bytes.js.map
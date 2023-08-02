import { IIssuerStore } from "../oid4vci/Issuer/index.types";
export declare class SimpleStore<T extends {
    id: string;
}> implements IIssuerStore<T> {
    private readFn;
    private writeFn;
    constructor(args: {
        reader: () => Promise<T[]>;
        writer: (data: T[]) => void;
    });
    create(payload: T): Promise<T>;
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T>;
    updateById(id: string, payload: Partial<T>): Promise<T>;
    deleteById(id: string): Promise<T>;
}

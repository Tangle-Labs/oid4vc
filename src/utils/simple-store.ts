import { IIssuerStore } from "../oid4vci/Issuer/index.types";

export class SimpleStore<T extends { id: string }> implements IIssuerStore<T> {
    private readFn: () => Promise<T[]> | T[];
    private writeFn: (data: T[]) => Promise<void> | void;

    constructor(args: {
        reader: () => Promise<T[]>;
        writer: (data: T[]) => void;
    }) {
        this.readFn = args.reader;
        this.writeFn = args.writer;
    }

    async create(payload: T): Promise<T> {
        const data = await this.getAll();
        await this.writeFn([...data, payload]);
        return payload;
    }

    async getAll(): Promise<T[]> {
        return this.readFn();
    }

    async getById(id: string): Promise<T> {
        const data = await this.getAll();
        return data.find((e) => e.id === id);
    }

    async updateById(id: string, payload: Partial<T>): Promise<T> {
        let item = await this.getById(id);
        item = { ...item, ...payload, id: item.id };
        const data = await this.getAll();
        const withoutItemArray = data.filter((i) => i.id !== item.id);
        await this.writeFn([...withoutItemArray, item]);
        return item;
    }

    async deleteById(id: string): Promise<T> {
        let item = await this.getById(id);
        const data = await this.getAll();
        const withoutItemArray = data.filter((i) => i.id !== item.id);
        await this.writeFn([...withoutItemArray]);
        return item;
    }
}

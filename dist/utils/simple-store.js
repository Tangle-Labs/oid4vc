export class SimpleStore {
    readFn;
    writeFn;
    constructor(args) {
        this.readFn = args.reader;
        this.writeFn = args.writer;
    }
    async create(payload) {
        const data = await this.getAll();
        await this.writeFn([...data, payload]);
        return payload;
    }
    async getAll() {
        return this.readFn();
    }
    async getById(id) {
        const data = await this.getAll();
        return data.find((e) => e.id === id);
    }
    async updateById(id, payload) {
        let item = await this.getById(id);
        item = { ...item, ...payload, id: item.id };
        const data = await this.getAll();
        const withoutItemArray = data.filter((i) => i.id !== item.id);
        await this.writeFn([...withoutItemArray, item]);
        return item;
    }
    async deleteById(id) {
        let item = await this.getById(id);
        const data = await this.getAll();
        const withoutItemArray = data.filter((i) => i.id !== item.id);
        await this.writeFn([...withoutItemArray]);
        return item;
    }
}
//# sourceMappingURL=simple-store.js.map
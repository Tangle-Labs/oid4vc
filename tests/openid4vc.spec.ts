import { startServer, stopServer } from "./mocks/server";
import { oid4vpSuite } from "./oid4vp.suite";
import { siopSuite } from "./siop.suite";

beforeAll(() => {
    startServer();
});

afterAll(() => {
    stopServer();
});

describe("SIOPv2", siopSuite);
describe("OpenID4VP", oid4vpSuite);

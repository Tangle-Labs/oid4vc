import { startServer, stopServer } from "./mocks/server";
import { oid4vciSuite } from "./suites/oid4vci.suite";
import { oid4vpSuite } from "./suites/oid4vp.suite";
import { siopSuite } from "./suites/siop.suite";

beforeAll(() => {
    startServer();
});

afterAll(() => {
    stopServer();
});

// describe("SIOPv2", siopSuite);
// describe("OpenID4VP", oid4vpSuite);
describe("OpenID4VCI", oid4vciSuite);

import express from "express";
import asyncHandler from "express-async-handler";
import { RelyingParty } from "../../src/siopv2/siop";
import { Server } from "http";
import { rp } from "./openid";

const app = express();
app.use(express.json());
let server: Server;

export const requestsMap = new Map<string, string>();

app.route("/siop/:id").get(
    asyncHandler(async (req, res) => {
        res.send(requestsMap.get(req.params.id));
    })
);

export function startServer(port = 5000) {
    app.route("/api/auth").post(
        asyncHandler(async (req, res) => {
            await rp.verifyAuthResponse(req.body);
            res.status(204).send();
        })
    );
    server = app.listen(port);
}

export function stopServer() {
    server.close();
}

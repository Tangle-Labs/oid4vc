import express from "express";
import asyncHandler from "express-async-handler";
import { Server } from "http";
import { rp } from "./openid";
import { presentationDefinition } from "./presentation-defs";

export const requestsMap = new Map<string, string>();
let server: Server;

export function startServer(port = 5000) {
    const app = express();
    app.use(express.json());
    app.route("/siop/:id").get(
        asyncHandler(async (req, res) => {
            res.send(requestsMap.get(req.params.id));
        })
    );

    app.route("/api/auth").post(
        asyncHandler(async (req, res) => {
            await rp.verifyAuthResponse(req.body, presentationDefinition);
            res.status(204).send();
        })
    );
    server = app.listen(port);
}

export function stopServer() {
    server.close();
}

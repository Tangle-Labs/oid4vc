import express from "express";
import asyncHandler from "express-async-handler";
import { Server } from "http";
import { issuer, rp } from "./openid";
import { presentationDefinition } from "./presentation-defs";
import { credentials } from "./keys.mock";

export const requestsMap = new Map<string, string>();
export const offersMap = new Map<string, Record<string, any>>();
let server: Server;

export function startServer(port = 5000) {
    const app = express();
    app.use(express.json());
    app.route("/siop/:id").get(
        asyncHandler(async (req, res) => {
            res.send(requestsMap.get(req.params.id));
        })
    );
    app.route("/.well-known/openid-credential-issuer").get(
        asyncHandler(async (req, res) => {
            const metadata = issuer.getIssuerMetadata();
            res.json(metadata);
        })
    );

    app.route("/.well-known/oauth-authorization-server").get(
        asyncHandler(async (req, res) => {
            const metadata = issuer.getOauthServerMetadata();
            res.json(metadata);
        })
    );

    app.route("/token").post(
        asyncHandler(async (req, res) => {
            const response = await issuer.createTokenResponse(req.body);
            res.json(response);
        })
    );

    app.route("/api/credential").post(
        asyncHandler(async (req, res) => {
            const response = await issuer.createSendCredentialsResponse({
                credentials: credentials,
            });
            res.json(response);
        })
    );

    app.route("/api/offers/:id").get(
        asyncHandler(async (req, res) => {
            res.json(offersMap.get(req.params.id));
        })
    );

    app.route("/api/credentials").post(
        asyncHandler(async (req, res) => {
            const response = await issuer.createSendCredentialsResponse({
                credentials: [...credentials, ...credentials],
            });
            res.json(response);
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

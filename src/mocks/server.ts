import express from "express";
import asyncHandler from "express-async-handler";
import { RelyingParty } from "../siopv2/siop";

const app = express();
app.use(express.json());

export const requestsMap = new Map<string, string>();

app.route("/siop/:id").get(
    asyncHandler(async (req, res) => {
        res.send(requestsMap.get(req.params.id));
    })
);

export function startServer(rp: RelyingParty, port = 5000) {
    app.route("/api/auth").post(
        asyncHandler(async (req, res) => {
            await rp.verifyAuthResponse(req.body);
            res.status(204).send();
        })
    );
    app.listen(port);
}

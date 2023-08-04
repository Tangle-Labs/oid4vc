import express from "express";
import asyncHandler from "express-async-handler";
import { SiopRequest } from "../siopv2/index.types";

const app = express();
app.use(express.json());

export const requestsMap = new Map<string, { request: SiopRequest }>();

app.route("/siop/:id").get(
    asyncHandler(async (req, res) => {
        res.json(requestsMap.get(req.params.id));
    })
);

export function startServer(port = 5000) {
    app.listen(port);
}

import { Resolvable } from "did-resolver";
import { KeyPairRequirements } from "../../common/index.types";
import { SigningAlgs } from "../siop";

export type OPOptions = {
    resolver: Resolvable;
} & KeyPairRequirements;

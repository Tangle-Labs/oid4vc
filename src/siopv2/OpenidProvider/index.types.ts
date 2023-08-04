import { Resolvable } from "did-resolver";
import { KeyPairRequirements } from "../../common/index.types";

export type OPOptions = { resolver: Resolvable } & KeyPairRequirements;

import { SigningAlgs } from "../../siopv2/siop";

export const testingKeys = {
    rp: {
        privKeyHex:
            "e48ad81c8e23939edf1e10bd87e04155901c304a0eaef240a729e6e8645ad66d",
        did: "did:jwk:eyJrdHkiOiJFQyIsIngiOiIwRW5wZ2NodWJxaG5jNWx6MDNvaGQtN0NoLVo5UmRsY0NWTmRUSDZCdFpBIiwieSI6ImhzcFJqZTNMb3Y0TE1vazdVblhLMGQxR1BtSjFFQmIwOUw0SGN5S01KUEUiLCJjcnYiOiJQLTI1NiJ9",
        kid: "did:jwk:eyJrdHkiOiJFQyIsIngiOiIwRW5wZ2NodWJxaG5jNWx6MDNvaGQtN0NoLVo5UmRsY0NWTmRUSDZCdFpBIiwieSI6ImhzcFJqZTNMb3Y0TE1vazdVblhLMGQxR1BtSjFFQmIwOUw0SGN5S01KUEUiLCJjcnYiOiJQLTI1NiJ9#0",
        signingAlgorithm: SigningAlgs.ES256,
    },
    op: {
        privKeyHex:
            "b8b37eceffb5f96c3fdec5172e2f74d35a8df6d0c723d38fe1c6c0e6a385d50d",
        did: "did:jwk:eyJrdHkiOiJFQyIsIngiOiJ2RXFsd2JWSVcyYVpHY1B0bkdVQ1IxelFhQlZPMWtjdVJiVlNTRDVWaEhzIiwieSI6ImNRR0lYZkNJSjZZUDNUSUdPb19taEQ0NTdEUlhCMGMxRlpZSHNIeTlaa3ciLCJjcnYiOiJQLTI1NiJ9",
        kid: "did:jwk:eyJrdHkiOiJFQyIsIngiOiJ2RXFsd2JWSVcyYVpHY1B0bkdVQ1IxelFhQlZPMWtjdVJiVlNTRDVWaEhzIiwieSI6ImNRR0lYZkNJSjZZUDNUSUdPb19taEQ0NTdEUlhCMGMxRlpZSHNIeTlaa3ciLCJjcnYiOiJQLTI1NiJ9#0",
        signingAlgorithm: SigningAlgs.ES256,
    },
};

export const credentials = [
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwid2FfZHJpdmluZ19saWNlbnNlIl0sImlkIjoiaHR0cDovL2NyZWQuY29tL3dhX2RyaXZpbmdfbGljZW5zZSIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJKb2UgU2NobW9lIiwiZGF0ZSBvZiBiaXJ0aCI6IjI0LTEyLTIwMDIiLCJTU04iOjQyMDY5LCJNYXJpdGlhbCBTdGF0dXMiOiJTaW5nbGUiLCJWb2x1bnRlZXJlZCBBdCI6IkNhcGUgQ2FuZXZyYWwifX0sInN1YiI6ImRpZDppb3RhOkVmZXk5eWFCQ2d2TG1XSjhIaFJBOXVmYlNDYXR5OExKeUMxZjdlWFhwVkMiLCJuYmYiOjE3MDIwMTc1MjcsImp0aSI6Imh0dHA6Ly9jcmVkLmNvbS93YV9kcml2aW5nX2xpY2Vuc2UiLCJpc3MiOiJkaWQ6a2V5Ono2TWtrSDZtaGFlRURWWUVEUGY5VnprWWptdWZHZUdiV1VpZWdzeGRCRW5Vb1hoUCN6Nk1ra0g2bWhhZUVEVllFRFBmOVZ6a1lqbXVmR2VHYldVaWVnc3hkQkVuVW9YaFAifQ.t0h_l21NUeTB5plVC6o2pB1OgUzd6w6A775pJ16lvpBj55_DhFbhwExW9n5G70RJUoonjv2zh3gIsaMKP04SCg",
];

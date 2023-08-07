export function joinUrls(baseUrl: string, relativeUrl: string): string {
    const normalizedBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
    const normalizedRelativeUrl = relativeUrl.startsWith("/")
        ? relativeUrl.slice(1)
        : relativeUrl;

    return `${normalizedBaseUrl}/${normalizedRelativeUrl}`;
}

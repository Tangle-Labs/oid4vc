export function joinURLs(url1: string, url2: string) {
    return removeTrailingSlash(url1) + "/" + removeLeadingSlash(url2);
}
export function removeLeadingSlash(url: string) {
    return url[0] == "/" ? (url = url.substr(1)) : url;
}
export function removeTrailingSlash(url: string) {
    return url[url.length - 1] == "/" ? url.substr(0, url.length - 1) : url;
}

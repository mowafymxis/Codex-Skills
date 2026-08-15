import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalizeUrl, hash, redact, sleep, stableId } from "./util.js";
function domainAllowed(url, config, competitor) {
    const host = url.hostname.toLowerCase();
    const official = new URL(competitor.url).hostname.toLowerCase();
    if (config.blockedDomains.some((x) => host === x || host.endsWith(`.${x}`)))
        return false;
    if (config.allowedDomains.length &&
        !config.allowedDomains.some((x) => host === x || host.endsWith(`.${x}`)))
        return false;
    return host === official || host.endsWith(`.${official}`);
}
function htmlText(html) {
    const title = html
        .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
        ?.replace(/\s+/g, " ")
        .trim() ?? "";
    const links = [...html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].map((x) => x[1] ?? "");
    const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
    return { title, text: redact(text), links };
}
async function robotsAllows(origin, pathname, timeoutMs) {
    try {
        const response = await fetch(`${origin}/robots.txt`, {
            signal: AbortSignal.timeout(timeoutMs),
            headers: { "user-agent": "competitor-feature-intelligence/1.0 (+local research tool)" },
        });
        if (!response.ok)
            return true;
        const rules = (await response.text()).split(/\r?\n/);
        let applies = false;
        for (const line of rules) {
            const [keyRaw, ...rest] = line.split(":");
            const key = keyRaw?.trim().toLowerCase();
            const value = rest.join(":").trim();
            if (key === "user-agent")
                applies = value === "*" || /competitor-feature-intelligence/i.test(value);
            if (applies && key === "disallow" && value && pathname.startsWith(value))
                return false;
        }
        return true;
    }
    catch {
        return true;
    }
}
async function fetchWithRetry(url, timeoutMs) {
    let last;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(url, {
                redirect: "follow",
                signal: AbortSignal.timeout(timeoutMs),
                headers: {
                    accept: "text/html,application/xhtml+xml",
                    "user-agent": "competitor-feature-intelligence/1.0 (+local research tool)",
                },
            });
            if (response.status !== 429 && response.status < 500)
                return response;
            last = new Error(`HTTP ${response.status}`);
        }
        catch (error) {
            last = error;
        }
        await sleep(200 * 2 ** attempt);
    }
    throw last instanceof Error ? last : new Error("Fetch failed");
}
export async function collectSources(config, cacheDirectory) {
    await mkdir(cacheDirectory, { recursive: true });
    const records = [];
    if (config.offline)
        return records;
    for (const competitor of config.competitors) {
        const queue = [{ url: competitor.url, depth: 0 }];
        const seen = new Set();
        const contentSeen = new Set();
        while (queue.length && seen.size < config.maxPagesPerCompetitor) {
            const item = queue.shift();
            let canonical;
            try {
                canonical = canonicalizeUrl(item.url);
            }
            catch {
                continue;
            }
            if (seen.has(canonical))
                continue;
            seen.add(canonical);
            const parsed = new URL(canonical);
            if (!domainAllowed(parsed, config, competitor)) {
                records.push(failureRecord(competitor, canonical, "blocked", "Domain is outside configured competitor scope."));
                continue;
            }
            if (!(await robotsAllows(parsed.origin, parsed.pathname, config.requestTimeoutMs))) {
                records.push(failureRecord(competitor, canonical, "blocked", "Blocked by robots.txt."));
                continue;
            }
            const cacheFile = path.join(cacheDirectory, `${stableId(canonical)}.json`);
            try {
                const cached = JSON.parse(await readFile(cacheFile, "utf8"));
                records.push({ ...cached, fetchStatus: "cached" });
                continue;
            }
            catch {
                /* cache miss */
            }
            try {
                const response = await fetchWithRetry(canonical, config.requestTimeoutMs);
                if (!response.ok) {
                    records.push(failureRecord(competitor, canonical, "failed", `HTTP ${response.status}`, response.status));
                    continue;
                }
                const parsedHtml = htmlText((await response.text()).slice(0, 2_000_000));
                const contentHash = hash(parsedHtml.text);
                if (contentSeen.has(contentHash))
                    continue;
                contentSeen.add(contentHash);
                const finalUrl = canonicalizeUrl(response.url);
                const record = {
                    competitorId: competitor.id,
                    url: canonical,
                    canonicalUrl: finalUrl,
                    sourceType: inferSourceType(finalUrl),
                    title: parsedHtml.title,
                    publisher: competitor.name,
                    isOfficial: true,
                    publishedAt: null,
                    retrievedAt: new Date().toISOString(),
                    contentHash,
                    fetchStatus: "success",
                    httpStatus: response.status,
                    text: parsedHtml.text,
                    relevantSnippets: [],
                    reliability: inferSourceType(finalUrl) === "pricing" || inferSourceType(finalUrl) === "documentation"
                        ? "high"
                        : "medium",
                    notes: [],
                };
                records.push(record);
                await writeFile(cacheFile, JSON.stringify(record, null, 2));
                if (item.depth < config.maxCrawlDepth)
                    for (const link of parsedHtml.links) {
                        try {
                            const absolute = new URL(link, finalUrl);
                            if (domainAllowed(absolute, config, competitor) &&
                                !/[?&](?:page|sort|filter|session)=/i.test(absolute.href))
                                queue.push({ url: absolute.href, depth: item.depth + 1 });
                        }
                        catch {
                            /* invalid link */
                        }
                    }
            }
            catch (error) {
                records.push(failureRecord(competitor, canonical, "failed", error instanceof Error ? error.message : "Fetch failed"));
            }
            if (config.crawlDelayMs)
                await sleep(config.crawlDelayMs);
        }
    }
    return records;
}
function failureRecord(competitor, url, status, note, httpStatus = null) {
    return {
        competitorId: competitor.id,
        url,
        canonicalUrl: url,
        sourceType: inferSourceType(url),
        title: "",
        publisher: competitor.name,
        isOfficial: true,
        publishedAt: null,
        retrievedAt: new Date().toISOString(),
        contentHash: "",
        fetchStatus: status,
        httpStatus,
        text: "",
        relevantSnippets: [],
        reliability: "unknown",
        notes: [note],
    };
}
function inferSourceType(url) {
    if (/pricing|plans/i.test(url))
        return "pricing";
    if (/docs|help|guide|api/i.test(url))
        return "documentation";
    if (/change|release|blog/i.test(url))
        return "changelog";
    if (/security|privacy|terms|trust/i.test(url))
        return "trust";
    return "product";
}
export async function ingestManualSources(file) {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (!Array.isArray(parsed))
        throw new Error("Manual source file must contain an array");
    return parsed.map((raw, index) => {
        if (!raw || typeof raw !== "object")
            throw new Error(`Manual source ${index} is invalid`);
        const x = raw;
        if (!x.competitorId || !x.url || typeof x.text !== "string")
            throw new Error(`Manual source ${index} requires competitorId, url, and text`);
        const text = redact(x.text);
        return {
            competitorId: x.competitorId,
            url: x.url,
            canonicalUrl: canonicalizeUrl(x.url),
            sourceType: x.sourceType ?? "manual",
            title: x.title ?? "Manual source",
            publisher: x.publisher ?? "User-provided",
            isOfficial: x.isOfficial ?? false,
            publishedAt: x.publishedAt ?? null,
            retrievedAt: x.retrievedAt ?? new Date().toISOString(),
            contentHash: hash(text),
            fetchStatus: x.fetchStatus === "failed" || x.fetchStatus === "blocked" ? x.fetchStatus : "manual",
            httpStatus: null,
            text,
            relevantSnippets: x.relevantSnippets ?? [],
            reliability: x.reliability ?? "unknown",
            notes: x.notes ?? ["User-provided offline evidence."],
        };
    });
}
//# sourceMappingURL=collector.js.map
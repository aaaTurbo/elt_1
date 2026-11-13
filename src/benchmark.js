import {performance} from 'node:perf_hooks';

const BYTES_IN_Mb = 1024 * 1024;
const REQUEST_TIMEOUT_MS = process.env.TIMEOUT || 15_000;

/**
 * Validates url.
 * @param {string | undefined} rawUrl
 * @returns {URL}
 */
export function validateUrl(rawUrl) {
    if (!rawUrl) throw new Error('No url provided. Example: node index.js https://example.com');

    let parsed;

    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error(`Bad URL: "${rawUrl}"`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error(`Only HTTP or HTTPS allowed (got: ${parsed.protocol})`);

    return parsed;
}

/**
 * Counts resulting statistics.
 * @param {number} totalBytes - total downloaded bytes.
 * @param {number} totalDurationMs - total duration.
 */
export function calculateStats(totalBytes, totalDurationMs) {
    const totalMegabits = totalBytes * 8 / BYTES_IN_Mb,
        totalSeconds = totalDurationMs / 1000;

    return {
        totalMegabits,
        speedMbps: totalSeconds > 0 ? totalMegabits / totalSeconds : 0,
    };
}

/**
 * Fetches one request w/o cache and full data collection.
 * @param {URL} targetUrl
 * @param {number} attemptIndex
 */
async function fetchSingle(targetUrl, attemptIndex) {
    const urlWithNoCache = new URL(targetUrl.toString());
    urlWithNoCache.searchParams.set('_nocache', `${Date.now()}_${attemptIndex}`);

    const start = performance.now();

    const response = await fetch(urlWithNoCache, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache',
        }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok)
        throw new Error(`HTTP error ${response.status} (${response.statusText})`);

    const buffer = await response.arrayBuffer();
    const durationMs = performance.now() - start;

    return {
        bytes: buffer.byteLength, durationMs,
    };
}

/**
 * Sequentially executes requests.
 * @param {URL} url
 * @param {number} count
 */
export async function runBenchmark(url, count = 10) {
    let totalBytes = 0;
    let totalDurationMs = 0;

    for (let i = 0; i < count; i++) {
        const {bytes, durationMs} = await fetchSingle(url, i);
        totalBytes += bytes;
        totalDurationMs += durationMs;
    }

    return calculateStats(totalBytes, totalDurationMs, count);
}

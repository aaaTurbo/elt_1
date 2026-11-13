import { validateUrl, runBenchmark } from './benchmark.js';

/**
 * Calculates the average download speed
 * and total downloaded data size.
 * @author Anton Semenov
 * @param {string} rawUrl - raw source url
 * @returns {void} prints average download speed.
 */
async function speedtest(rawUrl = process.argv[2]) {
        const url = validateUrl(rawUrl);
        const stats = await runBenchmark(url);

        console.log(`Average speed: ${stats.speedMbps.toFixed(2)} Mb/s`)
}

await speedtest()
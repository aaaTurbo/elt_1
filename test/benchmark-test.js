import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateUrl, calculateStats } from '../src/benchmark.js';

describe('validateUrl', () => {
    it('accepts correct https URL', () => {
        const url = validateUrl('https://example.com');
        assert.equal(url.hostname, 'example.com');
    });

    it('throws error if no URL was provided', () => {
        assert.throws(() => validateUrl(undefined), /No url/);
    });

    it('throws error on unsupported protocols', () => {
        assert.throws(() => validateUrl('ftp://://example.com'), /Bad URL/);
    });
});

describe('calculateStats', () => {
    it('correct counting average download speed in Mb/s', () => {
        const totalBytes = 10 * 1024 * 1024;
        const stats = calculateStats(totalBytes, 1000);

        assert.equal(stats.totalMegabits, 80)
        assert.equal(stats.speedMbps, 80);
    });

    it('correct execution on zero values', () => {
        const stats = calculateStats(0, 0)

        console.assert(stats.totalMegabits, 0);
        console.assert(stats.totalMegabits, 0);
    })

    it('correct execution on various values', () => {
        const totalBytes = 10 * 1024 * 1024;
        const stats = calculateStats(totalBytes, 0)

        console.assert(stats.totalMegabits, 10);
        console.assert(stats.totalMegabits, 0);
    })
});

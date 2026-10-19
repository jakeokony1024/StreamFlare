const API_BASE = 'https://api.themoviedb.org/3';
const CACHE_TTL_MS = 10 * 60 * 1000;
const responseCache = new Map();

async function tmdbGet(path, params = {}) {
    const token = process.env.TMDB_ACCESS_TOKEN;
    if (!token) {
        const error = new Error('Streaming search is not configured yet. Add TMDB_ACCESS_TOKEN to server/.env.');
        error.status = 503;
        throw error;
    }

    const url = new URL(`${API_BASE}${path}`);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
        const error = new Error(response.status === 401 || response.status === 403
            ? 'The TMDB API credential was rejected. Check TMDB_ACCESS_TOKEN in server/.env.'
            : 'The streaming data provider is temporarily unavailable. Please try again.');
        error.status = response.status === 401 || response.status === 403 ? 502 : 503;
        throw error;
    }
    return response.json();
}

async function getCached(key, load) {
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await load();
    responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    if (responseCache.size > 500) {
        for (const [cacheKey, item] of responseCache) {
            if (item.expiresAt <= Date.now()) responseCache.delete(cacheKey);
        }
    }
    return value;
}

function getRegionCode(value) {
    const code = String(value || 'US').toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) {
        const error = new Error('Region must be a two-letter country code.');
        error.status = 400;
        throw error;
    }
    return code;
}

async function getProviders(showId, region, mediaType) {
    return getCached(`providers:${region}:${mediaType}:${showId}`, async () => {
        const data = await tmdbGet(`/${mediaType}/${showId}/watch/providers`);
        const availability = data.results && data.results[region];
        if (!availability) return { link: null, subscription: [], free: [], adSupported: [] };

        const toProvider = (provider) => ({
            id: provider.provider_id,
            name: provider.provider_name,
            logo: provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : null,
        });
        return {
            link: availability.link || null,
            subscription: (availability.flatrate || []).map(toProvider),
            free: (availability.free || []).map(toProvider),
            adSupported: (availability.ads || []).map(toProvider),
        };
    });
}

async function withProviders(show, region) {
    const mediaType = show.media_type || 'tv';
    const isMovie = mediaType === 'movie';
    const providers = await getProviders(show.id, region, mediaType);
    return {
        id: show.id,
        mediaType,
        title: isMovie ? show.title : show.name,
        overview: show.overview || '',
        releaseDate: (isMovie ? show.release_date : show.first_air_date) || null,
        rating: Number.isFinite(show.vote_average) ? show.vote_average : null,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : null,
        providers,
    };
}

async function mapWithConcurrency(items, concurrency, mapper) {
    const output = new Array(items.length);
    let cursor = 0;
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            output[index] = await mapper(items[index]);
        }
    });
    await Promise.all(workers);
    return output;
}

async function findShows({ region: regionInput = 'US', query = '' } = {}) {
    const region = getRegionCode(regionInput);
    const normalizedQuery = String(query).trim().slice(0, 100);
    const listKey = `shows:${region}:${normalizedQuery.toLowerCase() || 'popular'}`;

    return getCached(listKey, async () => {
        const results = normalizedQuery
            ? await tmdbGet('/search/multi', { query: normalizedQuery, language: 'en-US', page: 1, include_adult: false })
            : await tmdbGet('/tv/popular', { language: 'en-US', page: 1 });
        const shows = (results.results || [])
            .filter((item) => !normalizedQuery || item.media_type === 'movie' || item.media_type === 'tv')
            .slice(0, 20)
            .map((item) => ({ ...item, media_type: item.media_type || 'tv' }));
        const hydrated = await mapWithConcurrency(shows, 5, (show) => withProviders(show, region));
        return {
            region,
            query: normalizedQuery,
            results: hydrated,
        };
    });
}

module.exports = { findShows };

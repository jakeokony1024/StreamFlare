import tmdb from '../../server/services/tmdb.js';

const { findShows } = tmdb;

function jsonResponse(data, status = 200) {
  return Response.json(data, { status });
}

export default async function shows(request) {
  if (request.method !== 'GET') {
    return jsonResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(request.url);
    const data = await findShows({
      region: url.searchParams.get('region') || undefined,
      query: url.searchParams.get('q') || '',
    });
    return jsonResponse(data);
  } catch (error) {
    const status = [400, 502, 503].includes(error.status) ? error.status : 503;
    if (status === 503 && error.status !== 503) {
      console.error('Show lookup failed:', error);
      return jsonResponse({ message: 'Could not load streaming data right now. Please try again.' }, status);
    }
    return jsonResponse({ message: error.message }, status);
  }
}

export const config = { path: '/api/shows' };

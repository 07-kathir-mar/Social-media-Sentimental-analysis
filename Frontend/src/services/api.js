const API_BASE_URL = 'http://127.0.0.1:8000';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.detail || data.message || JSON.stringify(data)
        : data || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function processComments(brand) {
  const response = await fetch(`${API_BASE_URL}/process-comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ brand }),
  });

  return handleResponse(response);
}

export async function aggregateSentiment(brand) {
  const response = await fetch(`${API_BASE_URL}/aggregate-sentiment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ brand }),
  });

  return handleResponse(response);
}

export async function getSentimentGraph(brand) {
  const params = new URLSearchParams({ brand });
  const response = await fetch(
    `${API_BASE_URL}/get-sentiment-graph?${params.toString()}`,
    {
      method: 'GET',
    },
  );

  return handleResponse(response);
}

export async function addComment(brand, text) {
  return fetch(`${API_BASE_URL}/add-comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ brand, text }),
  }).then((res) => res.json());
}

export async function getComments(brand) {
  const params = new URLSearchParams({ brand });
  const res = await fetch(`${API_BASE_URL}/get-comments?${params.toString()}`);
  return res.json();
}

export async function getAlerts(brand) {
  const params = new URLSearchParams({ brand });
  const response = await fetch(`${API_BASE_URL}/get-alerts?${params.toString()}`);
  return handleResponse(response);
}

export async function getThoughts(brand) {
  const params = new URLSearchParams({ brand });
  const res = await fetch(`${API_BASE_URL}/get-thoughts?${params.toString()}`);
  return res.json();
}

export async function getCustomAnalysis(brand, fromTime, toTime) {
  const params = new URLSearchParams({
    brand,
    from_time: fromTime,
    to_time: toTime,
  });
  const response = await fetch(`${API_BASE_URL}/get-custom-analysis?${params.toString()}`);
  return handleResponse(response);
}

export async function getSentimentalZones(brand) {
  const params = new URLSearchParams({ brand });
  const response = await fetch(`${API_BASE_URL}/get-sentimental-zones?${params.toString()}`);
  return handleResponse(response);
}

export async function getForecast(brand) {
  const params = new URLSearchParams({ brand });
  const response = await fetch(`${API_BASE_URL}/get-forecast?${params.toString()}`);
  return handleResponse(response);
}

export async function getForecastSimulation(brand, scenario) {
  const params = new URLSearchParams({ brand, scenario });
  const response = await fetch(`${API_BASE_URL}/get-forecast-simulation?${params.toString()}`);
  return handleResponse(response);
}

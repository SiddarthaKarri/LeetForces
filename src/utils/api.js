// Robust API fetcher using codetabs proxy
// This avoids CORS issues and seems more reliable than allorigins or corsproxy.io

export const fetchFromCodeforces = async (endpoint) => {
    const targetUrl = `https://codeforces.com/api${endpoint}`;

    // Using codetabs as a fallback since allorigins and corsproxy.io were failing
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Proxy error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};

const proxyUrl = import.meta.env.VITE_PROXY_URL || 'http://localhost:3000/proxy';
const res = await fetch(proxyUrl, {
  method: 'POST',
  headers: {
    ...headers,
    'X-Target-URL': ep.url,
    'X-SOAP-Action': ep.soapAction || '',
  },
  body: xmlBody,
  signal: ctrl.signal,
});

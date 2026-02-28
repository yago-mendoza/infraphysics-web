// Returns true when running on localhost — used to gate editor features
export function useIsLocalhost(): boolean {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

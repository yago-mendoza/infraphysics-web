import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

// A tab can outlive a deployment/build and still reference an old hashed lazy
// chunk. Vite emits this event before the import rejects. Refresh once so the
// browser picks up the current HTML manifest instead of showing a route error.
window.addEventListener('vite:preloadError', event => {
  event.preventDefault();
  const retryKey = 'infraphysics:chunk-reload';
  const lastRetry = Number(sessionStorage.getItem(retryKey) || 0);
  if (Date.now() - lastRetry < 10_000) return;
  sessionStorage.setItem(retryKey, String(Date.now()));
  window.location.reload();
});

window.setTimeout(() => sessionStorage.removeItem('infraphysics:chunk-reload'), 10_000);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

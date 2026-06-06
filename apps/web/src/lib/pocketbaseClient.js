import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = '/hcgi/platform';

// PocketBase is only used in Horizons AI editor environment.
// Initialize safely with try/catch to prevent errors on standard hosting.
let pocketbaseClient = null;
try {
  pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);
} catch (e) {
  console.warn('PocketBase not available (expected on standard hosting)', e);
}

export default pocketbaseClient;

export { pocketbaseClient };

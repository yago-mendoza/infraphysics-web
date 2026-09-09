import entries from '../data/content-routes.generated.json';
import { createContentRoutes } from './content/routes.js';

export const contentRoutes = createContentRoutes(entries);

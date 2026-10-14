/**
 * Type Catalogue
 *
 * The system type catalogs as consumers read them: the registry seen through the
 * read contract only. Its session lifecycle — connect and disconnect — stays with
 * bootstrap, which imports the registry directly.
 */

import { typeRegistry } from '@/core/models/TypeRegistry';
import type { TypeCatalogue } from '../types/systemType.types';

export const typeCatalogue: TypeCatalogue = typeRegistry;

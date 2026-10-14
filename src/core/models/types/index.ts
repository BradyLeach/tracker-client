// core/models/types/index.ts
import type { AnyObjectSchema } from 'yup';

export type ModelScalarType =
  | 'enum' | 'text' | 'string' | 'boolean'
  | 'date' | 'datetime' | 'dayjs'
  | 'number' | 'integer'
  | 'array'
  | string;

export type ModelFieldValidation = {
  nullable?: boolean;
  required?: boolean;
  requiredOnCreate?: boolean;
  isReadOnly?: boolean;
  min?: number;
  max?: number;
  format?: 'email' | 'url' | 'password';
  pattern?: string;
  matches?: RegExp;
  oneOf?: unknown[];
  default?: unknown;
  custom?: string[];
  items?: ModelArrayItem;
  [key: string]: unknown;
};

export type ModelArrayItem = {
  type: Exclude<ModelScalarType, 'array'>;
  values?: Array<{ value: string; label?: string }> | string[];
  validation?: Omit<ModelFieldValidation, 'items'>;
};

export type ModelFieldDefinition = {
  type: ModelScalarType;
  access?: string[];
  values?: Array<{ value: string; label?: string }> | string[];
  validation?: ModelFieldValidation;
};

export type ModelAssociationType = 'belongsTo' | 'hasOne' | 'hasMany' | 'belongsToMany';

/**
 * One edge of the model graph, as emitted by the backend `/definition` endpoint
 * keyed by resolved alias — the alias being the response key nested records arrive under.
 *
 * `foreignKey` is resolved server-side, so the client never re-derives the naming convention.
 * `type` says which side of the edge holds it: `belongsTo`/`belongsToMany` hold it on the
 * declaring model, `hasOne`/`hasMany` hold it on the target.
 */
export type ModelAssociationDescriptor = {
  type: ModelAssociationType;
  target: string;
  foreignKey: string;
  /** Second key of a many-to-many, held on the join model alongside `foreignKey`. */
  otherKey?: string;
  /** Join model name, present only on `belongsToMany`. Traversal is two hops through it. */
  via?: string;
};

export type ModelDefinition = {
  name: string;
  schema: Record<string, ModelFieldDefinition>;
  access?: { owner: string; ownerField: string; [k: string]: unknown };
  associations?: Record<string, ModelAssociationDescriptor>;
  validationSchema?: AnyObjectSchema;
};

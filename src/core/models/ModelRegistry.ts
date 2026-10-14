 
/**
 * ModelRegistry
 *
 * Stores and manages model definitions pulled from the backend `/definition` endpoint.
 * Lazily constructs and caches validation schemas using Yup.
 * Intended for frontend use to dynamically render forms, validate inputs, and reflect access rules.
 */
import { modelService } from './model.service';
import { buildValidationSchema } from './buildValidationSchema';
import { apiErrorMessage, formatApiError } from '@/core/utils';
import { logger } from '@/core/utils/logger';
import i18n from 'i18next';

import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { ModelAssociationDescriptor, ModelDefinition } from './types';

class ModelRegistry
{
    private definitions: Record<string, ModelDefinition> = {};

    /**
     * Loads all model definitions from backend into memory.
     * Called at app startup by ModelRegistryLoader during bootstrap.
     *
     * Fetches schema definitions from `/api/v1/system/controllers/definition` endpoint.
     * Stores definitions in memory for synchronous access throughout the application.
     *
     * @returns {Promise<void>} Resolves when all definitions are loaded
     * @throws {Error} If backend fetch fails or definitions are invalid
     */
    async load(): Promise<void>
    {
        return this._load( () => modelService.getModelDefinitions(), 'full' );
    }

    /**
     * Loads the definitions the unauthenticated forms validate against.
     *
     * Called pre-auth. The full set is authenticated, so before a session exists the
     * registry holds only the backend's public whitelist — enough for login,
     * registration and the newsletter form, and nothing else.
     *
     * Replaced by the full set once load() runs after login.
     *
     * @returns {Promise<void>} Resolves when the whitelisted definitions are loaded
     * @throws {Error} If backend fetch fails or definitions are invalid
     */
    async loadPublic(): Promise<void>
    {
        return this._load( () => modelService.getPublicModelDefinitions(), 'public' );
    }

    /**
     * Fetches a set of definitions and replaces whatever the registry holds.
     *
     * @param {Function} fetch - Returns the definitions response
     * @param {string} scope - Which set was requested, for logging
     */
    private async _load( fetch: () => Promise<ApiResponse<any>>, scope: string ): Promise<void>
    {
        const res = await fetch();

        if( res.status == 200 && res.data )
        {
            this.definitions = res.data;

            logger.debug( 'Model definitions loaded', {
                scope,
                modelCount: Object.keys( this.definitions ).length,
                models: Object.keys( this.definitions )
            } );

            return;
        }

        // if empty or error
        const message = res.status == 204
            ? apiErrorMessage( i18n.t, "resource.empty", { item: "models" } )
            : formatApiError( i18n.t, res.error );

        logger.error( message );
        throw new Error( message );
    }

    /**
     * Returns the raw model definition for a given model name.
     *
     * Provides access to complete model schema including field types, validation rules,
     * access control metadata, and relationships.
     *
     * @param {string} modelName - Name of the model to retrieve (e.g., 'identity', 'program')
     * @returns {ModelDefinition | undefined} Model definition if found, undefined otherwise
     */
    get( modelName: string ): ModelDefinition | undefined
    {
        return this.definitions[modelName];
    }

    /**
     * Lazily builds and caches a Yup validation schema for a model.
     *
     * On first access, transforms the backend field definitions into a Yup ObjectSchema.
     * Subsequent calls return the cached schema for performance.
     * Used by form renderers to validate user input before submission.
     *
     * @param {string} modelName - Name of the model to get validation for
     * @returns {any} Yup ObjectSchema if model exists, empty object otherwise
     */
    getValidation( modelName: string ): any
    {
        const model = this.definitions[modelName];
        if( !model || !model.schema ) return {};

        if( !model.validationSchema )
        {
            model.validationSchema = buildValidationSchema( model.schema );
        }
        return model.validationSchema;
    }

    /**
     * Checks if a model definition exists in the registry.
     *
     * @param {string} modelName - Name of the model to check
     * @returns {boolean} True if model is loaded, false otherwise
     */
    has( modelName: string ): boolean
    {
        return !!this.definitions[modelName];
    }

    /**
     * Returns every loaded definition, keyed by model name.
     *
     * The DataStore hashes the whole set to version its local database, so it needs the
     * definitions as a set rather than one at a time.
     *
     * @returns {Record<string, ModelDefinition>} All loaded definitions
     */
    all(): Record<string, ModelDefinition>
    {
        return this.definitions;
    }

    /**
     * Returns the association descriptors for a model, keyed by resolved alias.
     *
     * The alias is the response key nested records arrive under, which is what the
     * shredder matches on. Returns an empty object for a model with no associations.
     *
     * @param {string} modelName - Name of the model
     * @returns {Record<string, ModelAssociationDescriptor>} Descriptors keyed by alias
     */
    associations( modelName: string ): Record<string, ModelAssociationDescriptor>
    {
        return this.definitions[modelName]?.associations ?? {};
    }
}

export const modelRegistry = new ModelRegistry();

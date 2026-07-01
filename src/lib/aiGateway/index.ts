/**
 * AI Gateway - Provider-Agnostic AI Response System
 * 
 * This module provides a unified interface for interacting with multiple AI providers.
 * It uses an adapter pattern to allow easy addition of new providers without changing
 * the chat UI or core logic.
 * 
 * Architecture:
 * - AIProvider: Interface defining the contract for all providers
 * - Provider Adapters: Provider-specific implementations of AIProvider
 * - AI Gateway: Central dispatcher that routes requests to appropriate adapters
 * - Model Registry: Dynamic model fetching from provider APIs
 */

export * from './types';
export * from './gateway';
export * from './adapters';
export * from './models';

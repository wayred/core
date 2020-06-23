import {Metadata} from "./types";

type ComponentsRegistry = {
    [name: string]: any
}
type FunctionsRegistry = {
    [name: string]: any
}
type MetadataRegistry = {
    [name: string]: Metadata | null;
}
type ContextRegistry = {
    [name: string]: any;
}
export type Registry = {
    publish: (origin?: string) => void;
    components: {
        getAll: () => ComponentsRegistry;
        get: (name: string) => any;
        put: (name: string, fn: any, meta?: Metadata) => void;
        getMetadata: (name: string) => Metadata | null;
    };
    functions: {
        getAll: () => FunctionsRegistry;
        get: (name: string) => any;
        put: (name: string, fn: any) => void;
    };
    contexts: {
        getAll: () => ContextRegistry;
        get: (name: string) => any;
        put: (name: string, ctx: any) => void;
    }
}
const metadata: MetadataRegistry = {};
const components: FunctionsRegistry = {};
const functions: ComponentsRegistry = {};
const contexts: ContextRegistry = {};
const registryInstance: Registry = {
    publish: (origin?: string) => {
        const allowedOrigin = origin || 'http://localhost:14523';
        const receiveMessage = (event: any) => {
            if (event.origin !== allowedOrigin)
                return;
            const componentList = Object.keys(components);
            const functionList = Object.keys(functions);
            const contextList = Object.keys(contexts);
            event.source.postMessage({
                components: componentList,
                functions: functionList,
                metadata: metadata,
                contexts: contextList
            }, event.origin);
        }
        if (window) { // window will not exists on react-native projects
            window.addEventListener("message", receiveMessage, false);
        }
    },
    components: {
        getAll: () => components,
        get: (name: string) => components[name],
        put: (name: string, fn: any, meta?: Metadata) => {
            components[name] = fn;
            metadata[name] = meta || null;
        },
        getMetadata: (name: string): Metadata | null => metadata[name]
    },
    functions: {
        getAll: () => functions,
        get: (name: string) => functions[name],
        put: (name: string, fn: any) => {
            functions[name] = fn;
        }
    },
    contexts: {
        getAll: () => contexts,
        get: (name: string) => contexts[name],
        put: (name: string, ctx: any) => {
            contexts[name] = ctx;
        }
    }
};

export default registryInstance;
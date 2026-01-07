import { onActivated, onDeactivated, onMounted, onUnmounted } from "vue";

interface IEventRegistration {
    componentId: symbol;
    handler: (event: Event) => void;
}

type TEventType = keyof DocumentEventMap;
type TCleanupFn = () => void;

const eventRegistries = new Map<TEventType, Map<string, IEventRegistration>>();
const eventCleanups = new Map<TEventType, TCleanupFn>();

const getOrCreateRegistry = (eventType: TEventType) => {
    let registry = eventRegistries.get(eventType);

    if (!registry) {
        registry = new Map();
        eventRegistries.set(eventType, registry);
    }

    return registry;
};

const createEventListener = (eventType: TEventType) => {
    const eventHandler = (event: Event) => {
        const registry = eventRegistries.get(eventType);

        if (!registry) {
            return;
        }

        for (const registration of registry.values()) {
            registration.handler(event);
        }
    };

    document.addEventListener(eventType, eventHandler, { capture: true });

    return () => {
        document.removeEventListener(eventType, eventHandler, { capture: true });
    };
};

const ensureListenerExists = (eventType: TEventType) => {
    if (eventCleanups.has(eventType)) {
        return;
    }

    const cleanup = createEventListener(eventType);
    eventCleanups.set(eventType, cleanup);
};

const cleanupIfEmpty = (eventType: TEventType) => {
    const registry = eventRegistries.get(eventType);

    if (registry && registry.size) {
        return;
    }

    const cleanup = eventCleanups.get(eventType);
    if (cleanup) {
        cleanup();
        eventCleanups.delete(eventType);
    }

    eventRegistries.delete(eventType);
};

export const useGlobalEvent = (
    eventType: TEventType,
    handler: (event: Event) => void,
    options: { key: string }
) => {
    const componentId = Symbol("global-event-component");
    const registry = getOrCreateRegistry(eventType);

    const register = () => {
        registry.set(options.key, { componentId, handler });
        ensureListenerExists(eventType);
    };

    const unregister = () => {
        const current = registry.get(options.key);
        if (current?.componentId === componentId) {
            registry.delete(options.key);
            cleanupIfEmpty(eventType);
        }
    };

    onMounted(register);
    onUnmounted(unregister);
    onActivated(register);
    onDeactivated(unregister);
};

export const useGlobalKeydown = (
    handler: (event: KeyboardEvent) => void,
    options: { key: string }
) => {
    useGlobalEvent(
        "keydown",
        (event) => {
            if (event instanceof KeyboardEvent) {
                handler(event);
            }
        },
        options
    );
};

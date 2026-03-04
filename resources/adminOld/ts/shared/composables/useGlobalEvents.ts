import { onMounted, onUnmounted } from "vue";

interface IEventRegistration {
    handler: (event: Event) => void;
}

type TEventType = keyof DocumentEventMap;
type TCleanupFn = () => void;

const eventRegistries = new Map<TEventType, Map<Symbol, IEventRegistration>>();
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
    handler: (event: Event) => void
) => {
    const eventId = Symbol("global-event");
    const registry = getOrCreateRegistry(eventType);

    const register = () => {
        registry.set(eventId, { handler });
        ensureListenerExists(eventType);
    };

    const unregister = () => {
        registry.delete(eventId);
        cleanupIfEmpty(eventType);
    };

    onMounted(register);
    onUnmounted(unregister);
};

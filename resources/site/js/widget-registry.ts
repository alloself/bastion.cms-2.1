import { App as VueApp, Component, createApp } from 'vue';

export type WidgetDefinition = {
    component: Component;
    setupApp?: (app: VueApp<Element>, el: Element) => void;
};

const widgetRegistry: Map<string, WidgetDefinition> = new Map();

export function registerWidget(name: string, def: WidgetDefinition): void {
    widgetRegistry.set(name, def);
}

export function mountWidget(name: string, el: Element): VueApp<Element> | null {
    const def = widgetRegistry.get(name);
    if (!def) return null;
    const app = createApp(def.component);
    if (def.setupApp) def.setupApp(app, el);
    app.mount(el);
    return app;
}

export function autoMountWidgets(root: ParentNode = document): Array<VueApp<Element>> {
    const apps: Array<VueApp<Element>> = [];
    const nodes = root.querySelectorAll('[data-vue]');
    nodes.forEach((el) => {
        const name = el.getAttribute('data-vue');
        if (!name) return;
        const app = mountWidget(name, el);
        if (app) apps.push(app);
    });
    return apps;
}

export function getRegistry(): Map<string, WidgetDefinition> {
    return widgetRegistry;
}



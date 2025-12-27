import "vue-router";
import type { IModule } from "@/ts/shared/modules";

declare module "vue-router" {
    interface RouteMeta {
        module?: IModule;
        requiresAuth?: boolean;
    }
}

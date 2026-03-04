import "vue-router";
import type { IModule } from "@/ts/widgets";

declare module "vue-router" {
    interface RouteMeta {
        module?: IModule<IBaseEntity>;
        requiresAuth?: boolean;
    }
}

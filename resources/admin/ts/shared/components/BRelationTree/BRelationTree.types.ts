export type TBRelationTreeProps = {
    parentId: string;
    endpoint: string;
    itemTitle?: string;
    itemValue?: string;
    itemChildren?: string;
    relations?: string[];
    readonly?: boolean;
    label?: string;
    errorMessages?: string | string[];
};

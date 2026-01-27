export type TBRelationAutocompleteErrorMessages = string | string[] | undefined;

export type TBRelationAutocompleteProps = {
    moduleKey: string;
    itemTitle?: string;
    itemValue?: string;
    label?: string;
    placeholder?: string;
    readonly?: boolean;
    loading?: boolean;
    errorMessages?: TBRelationAutocompleteErrorMessages;
    debounceMs?: number;
    relations?: string[];
};

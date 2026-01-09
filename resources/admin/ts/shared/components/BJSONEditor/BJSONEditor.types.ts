export type TJSONEditorRow = {
    id: string;
    key: string;
    value: string;
};

export type TBJSONEditorErrorMessages = string | string[] | undefined;

export type TBJSONEditorProps = {
    modelValue?: string;
    readonly?: boolean;
    errorMessages?: TBJSONEditorErrorMessages;
    label?: string;
};

export type TJSONEditorRow = {
    id: string;
    key: string;
    value: string;
};

export type TBJSONEditorErrorMessages = string | string[] | undefined;

export type TJSONEditorValue = Record<string, string> | null;

export type TBJSONEditorProps = {
    modelValue?: TJSONEditorValue;
    readonly?: boolean;
    errorMessages?: TBJSONEditorErrorMessages;
    label?: string;
};

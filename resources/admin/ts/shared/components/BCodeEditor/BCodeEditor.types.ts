import type * as monaco from "monaco-editor";

export type TBCodeEditorErrorMessages = string | string[] | undefined;

export type TBCodeEditorOptions = Partial<
    monaco.editor.IStandaloneEditorConstructionOptions
>;

export type TBCodeEditorProps = {
    modelValue?: string;
    name?: string;
    height?: string;
    readonly?: boolean;
    loading?: boolean;
    errorMessages?: TBCodeEditorErrorMessages;
    options?: TBCodeEditorOptions;
};


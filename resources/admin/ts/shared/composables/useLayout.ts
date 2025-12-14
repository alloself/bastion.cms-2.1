import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type {
    ISmartFormField,
    TSmartFormGridLayout,
    TSmartFormLayout,
} from "@admin/ts/types";

const normalizeAreaName = (rawAreaName: string): string => {
    const trimmedName = rawAreaName.trim();
    if (trimmedName === "") {
        return "field";
    }

    const cleanedName = trimmedName.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (cleanedName === "") {
        return "field";
    }

    if (/^[0-9]/.test(cleanedName)) {
        return `field_${cleanedName}`;
    }

    return cleanedName;
};

const normalizeAreaToken = (rawToken: string): string => {
    const trimmedToken = rawToken.trim();
    if (trimmedToken === "." || trimmedToken === "") {
        return ".";
    }

    return normalizeAreaName(trimmedToken);
};

const extractQuotedLayoutRows = (layoutValue: string): string[] => {
    const layoutRows: string[] = [];
    const rowRegex = /"([^"]+)"/g;

    let match = rowRegex.exec(layoutValue);
    while (match !== null) {
        const rawRowValue = match[1];
        if (rawRowValue !== undefined) {
            const trimmedRowValue = rawRowValue.trim();
            if (trimmedRowValue !== "") {
                layoutRows.push(trimmedRowValue);
            }
        }

        match = rowRegex.exec(layoutValue);
    }

    return layoutRows;
};

const parseLayoutRows = (
    layoutValue: TSmartFormLayout | undefined
): string[] => {
    if (layoutValue === undefined) {
        return [];
    }

    if (Array.isArray(layoutValue)) {
        return layoutValue.map((row) => row.trim()).filter((row) => row !== "");
    }

    const trimmedLayout = layoutValue.trim();
    if (trimmedLayout === "") {
        return [];
    }

    const quotedRows = extractQuotedLayoutRows(trimmedLayout);
    if (quotedRows.length > 0) {
        return quotedRows;
    }

    return trimmedLayout
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row !== "");
};

const createSmartFormGridLayout = (
    fields: ISmartFormField[],
    layout: TSmartFormLayout | undefined
): TSmartFormGridLayout => {
    const layoutRows = parseLayoutRows(layout);
    if (layoutRows.length === 0) {
        return { isEnabled: false };
    }

    const fieldAreaByKey = fields.reduce<Record<string, string>>(
        (result, field) => {
            result[field.key] = normalizeAreaName(field.key);
            return result;
        },
        {}
    );

    const layoutRowsTokens = layoutRows
        .map((layoutRow) => {
            return layoutRow
                .split(/\s+/)
                .map((rawToken) => normalizeAreaToken(rawToken))
                .filter((token) => token !== "");
        })
        .filter((rowTokens) => rowTokens.length > 0);

    const columnCount = layoutRowsTokens.reduce((maxColumns, rowTokens) => {
        return Math.max(maxColumns, rowTokens.length);
    }, 0);

    if (columnCount <= 0) {
        return { isEnabled: false };
    }

    const paddedRows = layoutRowsTokens.map((rowTokens) => {
        if (rowTokens.length >= columnCount) {
            return rowTokens;
        }

        const paddingSize = columnCount - rowTokens.length;
        const paddingCells = Array.from({ length: paddingSize }, () => ".");
        return [...rowTokens, ...paddingCells];
    });

    const usedAreaNames = new Set<string>();
    paddedRows.forEach((rowTokens) => {
        rowTokens.forEach((token) => {
            if (token !== ".") {
                usedAreaNames.add(token);
            }
        });
    });

    const missingFieldAreas = fields.reduce<string[]>((result, field) => {
        const areaName = fieldAreaByKey[field.key];
        if (areaName !== undefined && !usedAreaNames.has(areaName)) {
            result.push(areaName);
        }
        return result;
    }, []);

    const missingFieldRows = missingFieldAreas.map((areaName) => {
        return Array.from({ length: columnCount }, () => areaName);
    });

    const finalLayoutRows = [...paddedRows, ...missingFieldRows];
    const templateAreas = finalLayoutRows
        .map((rowTokens) => `"${rowTokens.join(" ")}"`)
        .join(" ");

    return {
        isEnabled: true,
        templateAreas,
        templateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        fieldAreaByKey,
    };
};

export const useLayout = (
    fields: MaybeRefOrGetter<ISmartFormField[]>,
    layout: MaybeRefOrGetter<TSmartFormLayout | undefined>
) => {
    const smartFormGridLayout = computed<TSmartFormGridLayout>(() => {
        return createSmartFormGridLayout(toValue(fields), toValue(layout));
    });

    const isGridLayoutEnabled = computed(
        () => smartFormGridLayout.value.isEnabled
    );

    const formGridStyle = computed<Record<string, string> | undefined>(() => {
        const currentLayout = smartFormGridLayout.value;
        if (!currentLayout.isEnabled) {
            return undefined;
        }

        return {
            gridTemplateAreas: currentLayout.templateAreas,
            gridTemplateColumns: currentLayout.templateColumns,
        };
    });

    const fieldGridStyleByKey = computed<
        Record<string, Record<string, string> | undefined>
    >(() => {
        const currentLayout = smartFormGridLayout.value;
        if (!currentLayout.isEnabled) {
            return {};
        }

        return toValue(fields).reduce<
            Record<string, Record<string, string> | undefined>
        >((stylesByKey, field) => {
            const areaName = currentLayout.fieldAreaByKey[field.key];
            stylesByKey[field.key] = {
                gridArea:
                    areaName !== undefined
                        ? areaName
                        : normalizeAreaName(field.key),
            };
            return stylesByKey;
        }, {});
    });

    return {
        smartFormGridLayout,
        isGridLayoutEnabled,
        formGridStyle,
        fieldGridStyleByKey,
    };
};

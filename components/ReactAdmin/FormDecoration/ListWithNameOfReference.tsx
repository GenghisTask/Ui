import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { TextField } from 'react-admin';
import { ReactNode } from 'react';
export default {
    name: 'ListWithNameOfReference',
    priority: 10,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key.indexOf('_id') != -1 && 'table' in fieldTypes;
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement(
            fieldTypes.reference,
            {
                source: key,
                reference: inflection.pluralize(key.substr(0, key.length - 3))
            },
            new InferredElement({
                component: (props: { children: ReactNode } & InputProps) => (
                    <TextField source="name" />
                ),
                representation: () => `<TextField source="name" />`
            })
        )
};

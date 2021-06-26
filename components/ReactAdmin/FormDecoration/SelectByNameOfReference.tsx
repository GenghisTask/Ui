import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectInput } from 'react-admin';
import { ReactNode } from 'react';
export default {
    name: 'SelectByNameOfReference',
    priority: 10,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key.indexOf('_id') != -1 && 'form' in fieldTypes;
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
                    <SelectInput optionText="name" {...props} />
                ),
                representation: () => `<SelectInput optionText="name" />`
            })
        )
};

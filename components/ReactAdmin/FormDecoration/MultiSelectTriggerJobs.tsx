import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectArrayInput } from 'react-admin';
import { ReactNode } from 'react';
export default {
    name: 'SelectByNameOfReference',
    priority: 10,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key.indexOf('trigger') != -1 && 'form' in fieldTypes;
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement(
            fieldTypes.referenceArray,
            {
                source: key,
                reference: 'jobs'
            },
            new InferredElement({
                component: (props: { children: ReactNode } & InputProps) => (
                    <SelectArrayInput optionText="name" multiple={true} {...props} />
                ),
                representation: () => `<SelectInput optionText="name" />`
            })
        )
};

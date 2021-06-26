import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectInput } from 'react-admin';
export default {
    name: 'Default',
    priority: 1,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return (
            typeof fieldTypes[properties[key].type] != 'undefined' &&
            ((key == 'id' && record && record.id != 'null') || key != 'id')
        );
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement(fieldTypes[properties[key].type], {
            source: key
        })
};

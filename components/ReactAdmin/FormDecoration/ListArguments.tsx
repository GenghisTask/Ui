import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectArrayInput, Button, useRefresh } from 'react-admin';
import ContentAdd from '@material-ui/icons/Add';
import { ReactNode, useEffect, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import ChipInput from '../Arguments/ChipInput';
export default {
    name: 'ListArguments',
    priority: 20,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key.indexOf('arguments') != -1 && 'table' in fieldTypes;
    },
    infer: (properties, fieldTypes, record): InferredElement =>
        new InferredElement({
            component: (props: { children: ReactNode } & InputProps) => {
                return <></>;
            },
            representation: () => `<a/>`
        })
};

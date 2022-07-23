import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectArrayInput, Button, useRefresh } from 'react-admin';
import ContentAdd from '@material-ui/icons/Add';
import { ReactNode, useEffect, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import ChipInput from '../Arguments/ChipInput';
export default {
    name: 'SelectArguments',
    priority: 20,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key.indexOf('arguments') != -1 && 'form' in fieldTypes;
    },
    infer: (properties, fieldTypes, record): InferredElement =>
        new InferredElement({
            component: (props: { children: ReactNode } & InputProps) => {
                const form = useForm();
                const [argv, setArgv] = useState([]);
                const refresh = useRefresh();
                const { values } = useFormState({ subscription: { values: true } });
                useEffect(() => {
                    if (form.getState().values[record]) {
                        setArgv(form.getState().values[record]);
                    }
                }, [values]);
                return (
                    <>
                        {argv.map((argument, i) => (
                            <ChipInput
                                key={i}
                                record={record}
                                argument={argument}
                                source={`${record}[${i}]`}
                                onDelete={() => {
                                    setArgv(argv.filter((v, k) => k != i));
                                }}
                            />
                        ))}
                        <Button
                            label={record}
                            onClick={() => {
                                setArgv([...argv, '']);
                            }}
                        >
                            <ContentAdd />
                        </Button>
                    </>
                );
            },
            representation: () => `<a/>`
        })
};

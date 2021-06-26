import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectInput, TextInput } from 'react-admin';
import Button from '@material-ui/core/Button';
import { useEffect, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import CommentIcon from '@material-ui/icons/CommentOutlined';

export default {
    name: 'ShowLogFile',
    priority: 3,
    isValid: (resource, properties, fieldTypes, record) => {
        return resource == 'jobs' && 'form' in fieldTypes;
    },
    infer: (properties, fieldTypes, record): InferredElement =>
        new InferredElement({
            component: (props: { children: ReactNode } & InputProps) => {
                const [recordId, setRecordId] = useState(null);
                useEffect(()=>{
                    if (record) {
                        setRecordId(record.id);
                    }
                }, [record]);
                return (
                    <>
                        <Button
                            onClick={()=> window.open(`/api/static/log/${recordId}.stdout.log`)}
                        >
                            stdout
                        </Button>
                        <Button
                            onClick={()=> window.open(`/api/static/log/${recordId}.stderr.log`)}
                        >
                            stderr
                        </Button>
                    </>
                );
            },
            representation: () => `<a/>`
        })
};

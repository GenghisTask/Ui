import { InferredElement, InputProps } from 'ra-core';
import inflection from 'inflection';
import { SelectInput, TextInput } from 'react-admin';
import { ReactNode, useState, useEffect } from 'react';

import { IconButton } from '@material-ui/core';
import handleClickGenerator, {
    useCrontabActionLoadingState
} from '../CrontabAction/handleClickGenerator';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { useForm, useFormState } from 'react-final-form';
export default {
    name: 'CommandTextArea',
    priority: 2,
    isValid: (resource, properties, fieldTypes, key, record) => {
        return key == 'command' && 'form' in fieldTypes;
    },
    infer: (properties, fieldTypes, key, record): InferredElement =>
        new InferredElement({
            component: (props: { children: ReactNode } & InputProps) => {
                const form = useForm();
                const pull = handleClickGenerator('pull');
                const { values } = useFormState({ subscription: { values: true } });
                const [preview, setPreview] = useState('');
                const [lastRequest, setLastRequest] = useState(null);
                const [checked, setChecked] = useState(record ? [record.command] : []);
                const [expanded, setExpanded] = useState(
                    record && record.command
                        ? record.command.split('/').reduce((buf, path, i) => {
                              buf.push(i > 0 ? buf[i - 1] + '/' + path : path);
                              return buf;
                          }, [])
                        : []
                );
                const [nodes, setNodes] = useState([]);
                useEffect(() => {
                    if (nodes.length < 1) {
                        fetch(window.location.protocol + 'api/script/all')
                            .then((response) => response.json())
                            .then((json) => setNodes(json));
                    }
                }, [true]);

                useEffect(() => {
                    const script = form.getState().values.command;
                    if (script && script != lastRequest) {
                        setLastRequest(script);
                        fetch(window.location.protocol + 'api/script/' + script)
                            .then((response) => response.text())
                            .then((text) => setPreview(text));
                    } else if (!script) {
                        setPreview('');
                        setLastRequest('');
                    }
                }, [values]);

                return (
                    <>
                        <div style={{ float: 'left', maxWidth: '60%', overflowX: 'scroll' }}>
                            <CheckboxTree
                                nodes={nodes}
                                checked={checked}
                                expanded={expanded}
                                onExpand={(event) => {
                                    setExpanded(event);
                                    console.log(event);
                                }}
                                onCheck={(event) => {
                                    setChecked(event);
                                    form.change('command', event[0]);
                                }}
                            />
                        </div>
                        <div
                            style={{
                                float: 'left',
                                position: 'relative',
                                width: '20%'
                            }}
                        >
                        Select an executable file or <a href={`api/script/edit?file=${lastRequest}`}>click here</a> {lastRequest ? "to edit" : "create a new one"}
                        <a href={`api/script/edit?file=${lastRequest}`} style={{ textDecoration: 'none', color: 'black' }} >
                            <pre>{preview}</pre>
                        </a>
                        </div>
                        <div style={{ clear: 'both' }} />
                        <TextInput source="command" type="hidden" />
                    </>
                );
            },
            representation: () => `<TextInput multiline source="command" fullWidth />`
        })
};

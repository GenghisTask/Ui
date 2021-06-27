import * as React from 'react';
import { useEffect, useState, ReactNode } from 'react';
import inflection from 'inflection';
import { InferredElement, useResourceContext, InputProps } from 'ra-core';
import { useSwaggerApi } from './useSwaggerApi';
import { CreateView, SelectInput, TextField } from 'react-admin';
import FormDecoration from './FormDecoration';
import VirtualField from './VirtualField';
import CrontabAction from './CrontabAction';
import PropTypes from 'prop-types';

const ViewGuesser = (parentProps) => {
    const { View, recordContext, fieldTypes, parentElement, ...props } = parentProps;
    const resource = useResourceContext(props);
    const [inferredChild, setInferredChild] = useState(<></>);
    const api = useSwaggerApi();
    const { record } = recordContext();
    fieldTypes['integer'] = fieldTypes.number;
    useEffect(() => {
        const properties =
            api.paths['/api/swagger/' + resource.toLowerCase()].get.responses.default.schema.items
                .properties;
        const inferredElements = Object.keys(properties).reduce(
            (buf, key) => {
                FormDecoration.filter((decorator) =>
                    decorator.isValid(resource, properties, fieldTypes, key, record)
                )
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, 1)
                    .forEach((decorator) =>
                        buf.push(decorator.infer(properties, fieldTypes, key, record))
                    );
                return buf;
            },
            VirtualField.filter((decorator) =>
                decorator.isValid(resource, properties, fieldTypes, record)
            ).map((decorator) => decorator.infer(properties, fieldTypes, record))
        );
        const inferredChildObject = new InferredElement(
            parentElement,
            null,
            inferredElements
        );

        process.env.NODE_ENV !== 'production' &&
            // eslint-disable-next-line no-console
            console.log(
                `Guessed ${View.name} :
    
    export const ${inflection.capitalize(inflection.singularize(resource))}${
                    View.name
                } = props => (
    <${View.name} {...props}>
    ${inferredChildObject.getRepresentation()}
    </${View.name}>
    );`
            );

        setInferredChild(inferredChildObject.getElement());
    }, [api, record]);
    return <View children={inferredChild} {...props} actions={<CrontabAction {...props}/>} />;
};

ViewGuesser.propTypes = CreateView.propTypes;

const FormGuesser = ({ ContextProvider, controller, ...props }) => {
    const controllerProps = controller(props);
    return (
        <ContextProvider value={controllerProps}>
            <ViewGuesser {...props} />
        </ContextProvider>
    );
};

export default FormGuesser;

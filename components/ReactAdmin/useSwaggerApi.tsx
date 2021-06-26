import { useContext, createContext, useEffect, useState } from 'react';
import path from 'path';
import SwaggerParser from "@apidevtools/swagger-parser";
import { TestTranslationProvider } from 'ra-core';
import { isConstructorDeclaration } from 'typescript';

interface OpenAPIDocument {
    resources:any[];
    paths:{};
};

const ApiInternalContext = createContext<OpenAPIDocument>({resources:[], paths:{}});

export const useSwaggerApi: ()=>OpenAPIDocument = () => {
    const context = useContext(ApiInternalContext);
    return context;
};

export const ApiContext = props => {
    const [result, setResult] = useState({resources:[], paths:{}});
    useEffect(() => {
        const swaggerFile = path.join(process.cwd(), '/api/static/swagger.yaml');
        const parser = new SwaggerParser();
        parser.dereference(swaggerFile, (err, api) => {
            if (err) {return console.log(err)}
            api.resources = Object.keys(api.definitions).filter(x=>x.indexOf("-")==-1);
            setResult(api);
        });
    }, []);
    return (
        <ApiInternalContext.Provider value={result}>
            <ApiInternalContext.Consumer>
                {values => props.children(values)}
            </ApiInternalContext.Consumer>
        </ApiInternalContext.Provider>
    );
};
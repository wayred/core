import React, {ReactElement, useContext} from "react";
import {Registry} from "./registry";
import get from 'lodash.get';
import {ComponentConfig, Project, PropConfig} from "./types";
import set from "lodash.set";
import merge from "lodash.merge";
import Consumer from "./Consumer";

const getContexts = (props?: {[name: string]: PropConfig}): string[] => {
  const contexts: any = {};
  if (props) {
    Object.values(props).forEach(prop => {
      if (prop.ctxName !== undefined) {
        contexts[prop.ctxName] = true;
      }
    });
  }
  return Object.keys(contexts);
};

const getProperties = (props: BuilderProps, cfg: ComponentConfig, mergedProps?: {[name: string]: PropConfig}, contexts?: any): any => {
  const result: any = {};
  if (mergedProps) {
    Object.values(mergedProps).forEach(prop => {
      if (prop.value !== undefined) {
        set(result, prop.path, prop.value);
      } else if (prop.ctxPath !== undefined) {
        if (prop.ctxName !== undefined) {
          set(result, prop.path, get(contexts, `${prop.ctxName}.${prop.ctxPath}`));
        } else {
          console.error('ctxName is required if ctxPath is provided');
        }
      } else if (prop.handlerFn !== undefined) {
        const fn = props.registry.functions.get(prop.handlerFn);
        if (prop.ctxName !== undefined) {
          set(result, prop.path, (...args: any[]) => fn(cfg, contexts, ...args));
        } else {
          set(result, prop.path, (...args: any[]) => fn(cfg, ...args));
        }
      } else if (prop.selectorFn !== undefined) {
        const fn = props.registry.functions.get(prop.selectorFn);
        if (prop.ctxName !== undefined) {
          set(result, prop.path, fn(cfg, contexts));
        } else {
          set(result, prop.path, fn(cfg));
        }
      }
    });
  }
  return result;
};

const getMergedProps = (project: Project, cfg: ComponentConfig | null) => {
  if (!cfg) return {};
  let defaultProps = {};
  if (project.defaults && project.mainDefaultsSet && project.defaults[project.mainDefaultsSet]) {
    const defaultsSet = project.defaults[project.mainDefaultsSet];
    defaultProps = merge({}, defaultsSet.components[cfg.component] || {});
    if (cfg.groups) {
      cfg.groups.forEach(group => {
        merge(defaultProps, defaultsSet.groups[group]);
      });
    }
  }
  return merge(defaultProps, cfg.props);
};

const createComponent = (props: BuilderProps, cfg: ComponentConfig | null): ReactElement | null => {
  const {registry} = props;
  if (!cfg) {
    console.error('A valid configuration object must be supplied');
    return null;
  }
  const children = cfg.children && cfg.children.map(cfg => createComponent(props, cfg));
  const mergedProps = getMergedProps(props.project, cfg);
  const contexts = getContexts(mergedProps);
  if (contexts.length > 0) {
    return (
      <Consumer contextNames={contexts} contextIndex={0} registry={props.registry} contexts={{}}>
        {(contexts: any) => {
          const properties = getProperties(props, cfg, mergedProps, contexts);
          return React.createElement(registry.components.get(cfg.component), {
            ...properties,
            key: cfg.id
          }, children);
        }}
      </Consumer>
    )
  }
  const properties = getProperties(props, cfg, mergedProps);
  return React.createElement(registry.components.get(cfg.component), {
    ...properties,
    key: cfg.id
  }, children);
};


type BuilderProps = {
  project: Project;
  registry: Registry;
}

const Builder = (props: BuilderProps) => {
  if (!props.project) {
    console.error('A valid project configuration must be supplied');
    return null;
  }
  if (!props.project.views || Object.keys(props.project.views).length < 1) {
    console.error('The project configuration does not contains any valid view');
    return null;
  }
  const view = props.project.views[props.project.mainView || ''];
  if (!view) {
    console.error('The project configuration must have a main view defined');
    return null;
  }
  return createComponent(props, view.config);
};

export default Builder;
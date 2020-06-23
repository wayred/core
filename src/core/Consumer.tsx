import {Registry} from "./registry";
import React from "react";

type ConsumerProps = {
  contextNames: string[];
  contextIndex: number;
  registry: Registry;
  contexts: any;
  children: any;
}

const Consumer = (props: ConsumerProps) => {
  const contextName = props.contextNames[props.contextIndex];
  const Context = props.registry.contexts.get(contextName);
  const nextIndex = props.contextIndex + 1;

  if (nextIndex >= props.contextNames.length) {
    return (
      <Context.Consumer>
        {(context: any) =>
          props.children({
            ...props.contexts,
            [contextName]: context
          })
        }
      </Context.Consumer>
    );
  } else {
    return (
      <Context.Consumer>
        {(context: any) =>
          <Consumer contextNames={props.contextNames}
                    contextIndex={nextIndex}
                    registry={props.registry}
                    children={props.children}
                    contexts={{
                      ...props.contexts,
                      [contextName]: context
                    }}
          />
        }
      </Context.Consumer>
    );
  }
};
export default Consumer;
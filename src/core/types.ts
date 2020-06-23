export type ProjectType = 'react' | 'react-native';

export type PropConfig = {
  path: string;
  value?: any;
  ctxName?: string;
  ctxPath?: string;
  selectorFn?: string;
  handlerFn?: string;
}

export type ComponentConfig = {
  id: string;
  name?: string;
  component: string;
  props?: {
    [path: string]: PropConfig;
  };
  groups?: string[];
  children?: ComponentConfig[];
};

export type View = {
  id: string;
  name: string;
  config: ComponentConfig | null;
};

export type DefaultsSet = {
  name: string;
  components: {
    [name: string]: {
      [path: string]: PropConfig;
    }
  },
  groups: {
    [name: string]: {
      [path: string]: PropConfig;
    }
  }
}

export type Project = {
  _id: string;
  name: string;
  type?: ProjectType;
  createdOn: Date;
  modifiedOn: Date;
  views: {
    [name: string]: View;
  }
  mainView: string;
  defaults: {
    [name: string]: DefaultsSet;
  };
  mainDefaultsSet: string;
};

// ------------------------------
// -   metadata related types   -
// ------------------------------

export type Platform = 'ios' | 'android' | 'web';

export type PropType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'color'
  | 'enum'
  | 'function';

export type Metadata = {
  props: {
    [propName: string]: {
      required?: boolean;
      type: PropType;
      metadata?: Metadata;
      platforms?: Platform[];
      options?: string[];
    }
  }
};
import {
  flexProperties,
  flexDirectionValues,
  flexWrapValues,
  justifyContentValues,
  alignItemsValues,
  alignSelfValues,
  alignContentValues,
  parseCombineValue,
} from './util';


// const LAYOUT_WIDTH = Symbol('layoutWidth');
// const LAYOUT_HEIGHT = Symbol('layoutHeight');

const WIDTH = Symbol('width');
const HEIGHT = Symbol('height');
const FLEX = Symbol('flex');
const FLEX_FLOW = Symbol('flex-flow');
const CACLUTE_MARGIN = Symbol('caculate-margin');
const GET_FLEX_BASIS = Symbol('get-flex-basis');

class Config {
  constructor(config = {}, node, container) {
    this.config = {};
    this.node = node;
    this.container = container;
    Object.keys(config).forEach((item) => {
      if(!flexProperties.includes(item)) {
        throw new Error(`config ${item} is not valid`);
      }
      this[item] = config[item];
    });
  }

  get border() {
    return [this.borderTop, this.borderRight, this.borderBottom, this.borderLeft];
  }

  set border(value) {
    value = parseCombineValue(value);
    this.borderTop = value[0];
    this.borderRight = value[1];
    this.borderBottom = value[2];
    this.borderLeft = value[3];
  }

  get position() {
    return [this.top, this.right, this.bottom, this.left];
  }

  set position(value) {
    value = parseCombineValue(value);
    this.top = value[0];
    this.right = value[1];
    this.bottom = value[2];
    this.left = value[3];
  }

  get padding() {
    return [this.paddingTop, this.paddingRight, this.paddingBottom, this.paddingLeft];
  }

  set padding(value) {
    value = parseCombineValue(value);
    this.paddingTop = value[0];
    this.paddingRight = value[1];
    this.paddingBottom = value[2];
    this.paddingLeft = value[3];
  }

  get margin() {
    return [this.marginTop, this.marginRight, this.marginBottom, this.marginLeft];
  }

  set margin(value) {
    value = parseCombineValue(value);
    this.marginTop = value[0];
    this.marginRight = value[1];
    this.marginBottom = value[2];
    this.marginLeft = value[3];
  }

  get flex() {
    return this[FLEX];
  }

  set flex(value) {
    this[FLEX] = value;
    if(value === 'none') return;
    if(typeof value === 'number') {
      this.flexGrow = value;
      this.flexShrink = 1;
    }
  }

  [CACLUTE_MARGIN](prop, parentValue) {
    const value = this[prop];
    if(value === 'auto') return 0;
    // percent value
    if(/%$/.test(value)) {
      if(!parentValue) {
        throw new Error('parent node width & height must be set when margin value is precent');
      }
      const ret = parentValue * parseFloat(value, 10);
      this[prop] = ret;
      return ret;
    }
    return value || 0;
  }

  [GET_FLEX_BASIS](type = 'width') {
    const flexDirection = this.container.flexDirection;
    const flexBaxis = this.flexBaxis;
    if(flexBaxis && flexBaxis !== 'auto') {
      const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
      if(type === 'width' && isRow || type === 'height' && !isRow) {
        return flexBaxis;
      }
    }
  }

  get layoutWidth() {
    // if(this[LAYOUT_WIDTH]) return this[LAYOUT_WIDTH];
    let width = this[GET_FLEX_BASIS]('width') || this.computedWidth || 0;
    const minWidth = this.minWidth;
    const maxWidth = this.maxWidth;
    if(minWidth && width < minWidth) {
      width = minWidth;
    }
    if(maxWidth && width > maxWidth) {
      width = maxWidth;
    }

    const props = [];
    if(this.boxSizing !== 'border-box') {
      props.push('borderLeft', 'borderRight', 'paddingLeft', 'paddingRight');
    }
    const parentWidth = this.node.parent.computedWidth;
    const marginLeft = this[CACLUTE_MARGIN]('marginLeft', parentWidth);
    const marginRight = this[CACLUTE_MARGIN]('marginRight', parentWidth);
    let value = marginLeft + marginRight;
    props.forEach((item) => {
      value += this[item] || 0;
    });
    // this[LAYOUT_WIDTH] = width + value;
    return width + value;
  }

  get layoutHeight() {
    // if(this[LAYOUT_HEIGHT]) return this[LAYOUT_HEIGHT];
    let height = this[GET_FLEX_BASIS]('height') || this.computedHeight || 0;
    const minHeight = this.minHeight || 0;
    const maxHeight = this.maxHeight || 0;
    if(minHeight && height < minHeight) {
      height = minHeight;
    }
    if(maxHeight && height > maxHeight) {
      height = maxHeight;
    }

    const props = [];
    if(this.boxSizing !== 'border-box') {
      props.push('borderTop', 'borderBottom', 'paddingTop', 'paddingBottom');
    }
    const parentHeight = this.node.parent.computedHeight;
    const marginTop = this[CACLUTE_MARGIN]('marginTop', parentHeight);
    const marginBottom = this[CACLUTE_MARGIN]('marginBottom', parentHeight);
    let value = marginTop + marginBottom;
    props.forEach((item) => {
      value += this[item] || 0;
    });
    // this[LAYOUT_HEIGHT] = height + value;
    return height + value;
  }

  get flexFlow() {
    return this[FLEX_FLOW];
  }

  set flexFlow(value) {
    value.split(/\s+/).forEach((item) => {
      if(!item) return;
      if(flexDirectionValues.includes(item)) {
        this.flexDirection = item;
      } else if(flexWrapValues.includes(item)) {
        this.flexWrap = item;
      } else {
        throw new Error(`FlexFlow: ${value} is not valid`);
      }
    });
    this[FLEX_FLOW] = value;
  }

  get width() {
    return this[WIDTH];
  }

  set width(value) {
    this.computedWidth = value;
    this[WIDTH] = value;
  }

  get height() {
    return this[HEIGHT];
  }

  set height(value) {
    this.computedHeight = value;
    this[HEIGHT] = value;
  }
}

const properties = {
  flexDirection: flexDirectionValues,
  flexWrap: flexWrapValues,
  justifyContent: justifyContentValues,
  alignItems: alignItemsValues,
  alignSelf: alignSelfValues,
  alignContent: alignContentValues,
};

Object.keys(properties).forEach((property) => {
  Object.defineProperty(Config.prototype, property, {
    get() {
      return this.config[property] || properties[property][0];
    },
    set(value) {
      const allowValues = properties[property];
      if(!allowValues.includes(value)) {
        throw new Error(`${property}:${value} is not valid`);
      }
      this.config[property] = value;
    },
    enumerable: true,
    configurable: true,
  });
});

export default Config;
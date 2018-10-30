import React, { Component } from 'react';
import { is } from "immutable";

import { Row, Col, Checkbox } from 'tinper-bee'

import "./CollapseItem.less";

class Collapse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCollapse: false,
      collapse: true,
      lastIndex: 0,
      data: [],
      multi: [],
      initialed: false
    }
  }

  componentDidMount() {
    this._shouldCollapse();
    this._checkInit();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._shouldCollapse();
    this._checkInit();
  }

  // 用于处理初始化之后属性变化情况，要兼容初始化情况
  componentWillReceiveProps(nextProps) {
    // 如果是自定义的内容，不初始化
    if (nextProps.render instanceof Function) return;
    if (nextProps.multiCheck) {
      if (is(this.props.data, nextProps.data)) return;
      let data = clone(nextProps.data);
      data.forEach((item, index) => {
        item.c_inner_checked = false;
        item.c_inner_key = index;
      });
      this.setState({
        data,
        multi: []
      });
      // 如果没有该属性，说明不存在选项之间的相互影响，有则执行样式处理逻辑
    } else if (nextProps.hasOwnProperty('defaultSelected')) {
      let IDIndex = nextProps.IDIndex;
      let ass = this._data_content.getElementsByTagName('a');
      let lastA = ass[this.state.lastIndex];
      let indexNum = nextProps.data.findIndex(item => item[IDIndex] === nextProps.defaultSelected);
      // 如果没有该数据项，则清空选中样式，恢复初始样式
      if (indexNum === -1) {
        if (lastA) lastA.className = '';
        this.setState({ lastIndex: 0 });
        return;
      }
      // 如果有该数据项，更新样式
      if (lastA) lastA.className = '';
      let defaultA = ass[indexNum];
      // 再选中默认值
      if (nextProps.defaultSelected && defaultA && defaultA.className === '') {
        defaultA.className = 'c-d-active';
        // 选中相当于操作，注意改变上次操作记录
        this.setState({ lastIndex: indexNum });
      }
    }
  }

  _checkInit = () => {
    if (!this.state.initialed) {
      const { data } = this.props
      let dataLen = data.length;
      // 没数据直接跳过
      if (dataLen === 0) return;
      if (this.props.multiCheck) {
        let cd = clone(data);
        cd.forEach((item, index) => {
          item.c_inner_checked = false;
          item.c_inner_key = index;
        });
        this.setState({
          data: cd,
          multi: []
        });
      }
      this.setState({ initialed: true }, this._initCss);
    }
  }

  _initCss = () => {
    // 先初始化样式
    // 如果是自定义的内容，不初始化
    if (this.props.render instanceof Function) return;
    if (this.props.multiCheck && this.state.multi.length > 0) {
      let data = this.state.data;
      data.forEach((item, index) => {
        item.c_inner_checked = false;
      });
      this.setState({
        data,
        multi: []
      });
      // 暂时不给多选情况添加默认选中的功能
      // 如果没有该属性，说明不存在选项之间的相互影响，有则执行逻辑
    } else if (this.props.hasOwnProperty('defaultSelected')) {
      let IDIndex = this.props.IDIndex;
      let ass = this._data_content.getElementsByTagName('a');
      let indexNum = this.props.data.findIndex(item => item[IDIndex] === this.props.defaultSelected);
      if (indexNum === -1) {
        ass[this.state.lastIndex].className = '';
        this.setState({ lastIndex: 0 });
        return;
      }
      // 再选中默认值
      if (this.props.defaultSelected && ass[indexNum].className === '') {
        ass[indexNum].className = 'c-d-active';
        // 选中相当于操作，注意改变上次操作记录
        this.setState({ lastIndex: indexNum });
      }
    }
  }

  _shouldCollapse = () => {
    let warppers = this.props.render
      ? this._data_content.getElementsByClassName('c-d-s-warpper')
      : this._data_content.getElementsByTagName('a');
    if (warppers.length === 0 && this.state.showCollapse) {
      this.setState({
        showCollapse: false,
        collapse: true
      });
      return;
    }
    let len = warppers.length;
    let width = 0;
    if (this.props.autoWidth || this.props.render) {
      let margin = this.props.render ? 0 : 30;
      for (let index = 0; index < len; index++) {
        width += warppers[index].offsetWidth + margin;
      }
    } else {
      width = this.props.multiCheck ? len * 150 : len * 130;
    }
    if (!this.state.showCollapse && width > this._data_content.offsetWidth) {
      this.setState({ showCollapse: true });
    } else if (this.state.showCollapse && width < this._data_content.offsetWidth) {
      this.setState({ showCollapse: false });
    }
  }

  _handleCollapse = (e) => {
    e.stopPropagation();
    this.setState({ collapse: !this.state.collapse });
  }

  /**
   * 点击选项时触发的事件，参数用于传递到传入的select函数中
   * @param description 选项所属的描述
   * @param value 选项值
   * @param index 选项索引
   */
  _onSelect = (description, value, index) => (e) => {
    e.stopPropagation();
    let lastA = this._data_content.getElementsByTagName('a')[this.state.lastIndex];
    lastA.className = '';
    e.target.className = e.target.className === 'c-d-active' ? '' : 'c-d-active';
    this.setState({ lastIndex: index });
    if (this.props.onSelect) {
      this.props.onSelect(description, value);
    }
  }

  _onMultiSelect = (description, value, index) => (e) => {
    let { data, multi } = this.state;
    data[index].c_inner_checked = !data[index].c_inner_checked;
    this.setState({ data });

    // 用index作为数据唯一标识
    if (multi.filter((item) => item.c_inner_key === index).length === 0) {
      let tempData = clone(value);
      tempData.c_inner_key = index;
      multi.push(tempData);
    } else {
      multi = multi.filter((item) => item.c_inner_key !== index);
    }
    this.setState({ multi }, () => {
      // 调用钩子函数时，先处理一下数据，去掉组件内使用的 checked 属性，保证数据纯度
      let pureData = clone(multi);
      pureData.forEach(item => {
        if (!(typeof item.c_inner_checked === 'undefined'))
          delete item.c_inner_checked;
        if (!(typeof item.c_inner_key === 'undefined'))
          delete item.c_inner_key
      });
      this.props.onSelect && this.props.onSelect(description, pureData);
    });

  }

  _selectAll = (description) => (e) => {
    let { data } = this.state;
    let multi = [];
    data.forEach(item => {
      item.c_inner_checked = true;
      multi.push(item);
    });
    this.setState({
      data,
      multi
    }, () => {
      let pureData = clone(this.state.multi);
      pureData.forEach(item => {
        if (!(typeof item.c_inner_checked === 'undefined'))
          delete item.c_inner_checked;
        if (!(typeof item.c_inner_key === 'undefined'))
          delete item.c_inner_key
      });
      this.props.onSelect && this.props.onSelect(description, pureData);
    });
  }

  _selectNone = (description) => (e) => {
    let { data } = this.state;
    data.forEach(item => item.c_inner_checked = false);
    this.setState({
      data,
      multi: []
    });
    this.props.onSelect && this.props.onSelect(description, []);
  }

  render() {
    let { dataIndex } = this.props;
    let data = this.props.multiCheck ? this.state.data : this.props.data;
    return (
      <div style={this.props.style} className={'s-collapse-w ' + this.props.className}>
        <Row style={{ margin: '0', position: 'relative' }}>
          <div className={'description'}>
            <span>{this.props.description}</span>
          </div>
          <div ref={elm => this._data_content = elm} style={{ width: '86%', position: 'relative', left: '7%' }}>
            {
              this.props.multiCheck
                ? (
                  data.length === 0
                    ? <span style={{ display: 'block', height: '30px', lineHeight: '30px', paddingLeft: '15px' }}>
                      暂无数据</span>
                    : (
                      <Col className={this.state.collapse ? 'c-inner-d-c' : 'c-inner-d-c all'}>
                        {
                          data.map((item, index) => {
                            if (this.props.render) {
                              let pureData = clone(item);
                              delete pureData.c_inner_checked;
                              return (
                                <div key={index} className='c-d-s-warpper'>
                                  {
                                    this.props.render({
                                      description: this.props.description,
                                      data: pureData
                                    }, index)
                                  }
                                </div>
                              )
                            } else {
                              return (
                                <div key={index} className={this.props.autoWidth ? 'c-d-a-warpper m-auto-width' : 'c-d-a-warpper m-fixed-width'}>
                                  <Checkbox
                                    onChange={this._onMultiSelect(this.props.description, item, index)}
                                    checked={typeof item.c_inner_checked === 'boolean' ? item.c_inner_checked : false}
                                  >
                                    <a href='javascript:void(0)'
                                      style={{ marginTop: '0', lineHeight: '8px' }}>{item[dataIndex]}</a>
                                  </Checkbox>
                                </div>
                              )
                            }
                          })
                        }
                      </Col>
                    )
                )
                : (
                  data.length === 0
                    ? <span style={{ display: 'block', height: '30px', lineHeight: '30px', paddingLeft: '15px' }}>
                      暂无数据</span>
                    : (
                      <Col className={this.state.collapse ? 'c-inner-d-c' : 'c-inner-d-c all'}>
                        {
                          data.map((item, index) => {
                            if (this.props.render) {
                              return (
                                <div key={index} className='c-d-s-warpper'>
                                  {
                                    this.props.render({
                                      description: this.props.description,
                                      data: item
                                    }, index)
                                  }
                                </div>
                              )
                            } else {
                              return (
                                <div key={index} className={this.props.autoWidth ? 'c-d-a-warpper auto-width' : 'c-d-a-warpper fixed-width'}>
                                  <a href='javascript:void(0)' onClick={this._onSelect(this.props.description, item, index)}>{item[dataIndex]}</a>
                                </div>
                              )
                            }
                          })
                        }
                      </Col>
                    )
                )
            }
          </div>
          <div className='more'>
            {
              this.props.multiCheck
                ? <div style={{ display: 'inline-block' }}>
                  <a href='javascript:void(0)' onClick={this._selectAll(this.props.description)}>全选</a>
                  <a style={{ margin: '0 15px' }} href='javascript:void(0)' onClick={this._selectNone(this.props.description)}>清空</a>
                </div>
                : null
            }
            {
              this.state.showCollapse
                ? <a href='javascript:void(0)' onClick={this._handleCollapse}>{this.state.collapse ? '展开更多' : '收起'}</a>
                : null
            }
          </div>
        </Row>
      </div>
    )
  }
}

Collapse.defaultProps = {
  description: '',
  data: [],
  dataIndex: '',
  IDIndex: '',
  multiCheck: false,
  style: {},
  className: '',
  render: undefined
}

function clone(obj) {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; ++i) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }
}

export default Collapse;
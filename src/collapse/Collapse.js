import React, { Component } from "react";
import CollapseItem from "./CollapseItem";

import "./Collapse.less"
class Collapse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialed: false
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._checkInit();
  }

  _checkInit = () => {
    if (!this.state.initialed) {
      let { data } = this.props
      let dataLen = data.length;
      // 没数据直接跳过
      if (dataLen === 0) return;

      let shouldInit = true;
      // 只要有数据没获取到，就false，跳过
      for (let i = 0; i < dataLen; i++) {
        if (data[i].dataSource.length === 0) {
          shouldInit = false
          break;
        }
      }
      if (!shouldInit) return;
      // 遍历以后如果 shouldInit === true，则 setState，并对子组件进行初始化样式处理
      this.setState({ initialed: true });
    }
  }

  _onSelect = (description, value) => {
    // 封装数据，调用上层组件给予的 onSelect 方法
    this.props.onSelect && this.props.onSelect({
      description: description,
      data: value
    });
  }

  render() {
    let { rule, data } = this.props;
    return (
      <div>
        {
          data.map((item, index) => {
            return (
              <CollapseItem
                key={index}
                description={item[rule.descriptionIndex]}
                data={item.dataSource}
                dataIndex={rule.dataIndex}
                IDIndex={rule.IDIndex}
                defaultSelected={item.defaultSelected}
                render={item.render}
                onSelect={this._onSelect}
                autoWidth={this.props.autoWidth}
                multiCheck={item.multiCheck ? item.multiCheck : false}
                className={this.props.className ? this.props.className : ''}
                style={this.props.style ? this.props.style : {}}
              />
            )
          })
        }
      </div>
    )
  }
}

Collapse.defaultProps = {
  data: [],
  rule: {
    descriptionIndex: '',
    dataIndex: '',
    IDIndex: ''
  },
  onSelect: undefined,
  autoWidth: false
}

export default Collapse;
import React, { Component } from 'react';
import axios from "axios";
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/zh-cn';

import Collapse from "./collapse/Collapse";

const rules = {
  descriptionIndex: 'description',
  dataIndex: 'name',
  IDIndex: 'id'
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '',
      data: [],
      jsonEnvVarText: {}
    }
  }

  componentDidMount() {
    axios.get('http://localhost:8080/devtest').then(res => {
      console.log(res)
      this.setState({
        data: res.data
      })
    });
  }

  handleSelectItem = (rec) => {
    console.log(rec);
    if (rec.description === '产品') {
      this.setState({
        selected: rec.data.id
      })
    }
  }

  render() {
    const { data } = this.state;
    let collapseData = [
      {
        description: '产品线',
        dataSource: data[0],
        render: (rec, index) => {
          return <a style={{ display: 'inline-block' }} onClick={this.handleSelectItem.bind(this, rec)}>
            <span>{rec.data.name}</span>
          </a>
        }
      },
      {
        description: '产品',
        dataSource: data[1],
        defaultSelected: this.state.selected
      },
      {
        description: '测试多选',
        dataSource: data[2],
        multiCheck: true
      }
    ];
    return (
      <div><Collapse
        rule={rules}
        data={collapseData}
        onSelect={this.handleSelectItem}
        autoWidth={false}
        className='collapse-warp'
      />
        <JSONInput
          id='jsonEditor'
          placeholder={this.state.jsonEnvVarText}
          theme='dark_vscode_tribute'
          waitAfterKeyPress={2000}
          locale={locale}
          height='300px'
          width='500px'
        /></div>
      
    );
  }
}

export default App;

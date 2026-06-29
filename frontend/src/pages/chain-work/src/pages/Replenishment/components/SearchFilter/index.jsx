import React, { useState, useEffect } from 'react';
import { Field, Select, DatePicker2, Input, Button, Form, Grid } from '@alifd/next';
import filterSchema, { SCHEMA_INPUT, SCHEMA_SELECT, SCHEMA_RANGE_PICKER, SCHEMA_DATE_PICKER } from './filterSchema';

import './index.scss';

const FormItem = Form.Item;
const { RangePicker } = DatePicker2;
const { Row, Col } = Grid;
export default (props) => {
  const { status = null, showSearchAction = true, onSearch = () => { }, fieldOpt = {} } = props;
  const [filterFetchData, setFilterFetchData] = useState({});
  const filters = filterSchema(status);

  const field = Field.useField({});

  const { init } = field;
  const typeMap = {
    [SCHEMA_SELECT]: ({ opt = {}, values, key, fetchData }) => {
      if (fetchData && !filterFetchData[key]) {
        fetchData()
          .then((res) => {
            setFilterFetchData({
              ...filterFetchData,
              [key]: res,
            });
          });
      }
      const _values = fetchData ? filterFetchData[key] : values;
      return (
        <Select
          {...init(key)}
          dataSource={_values}
          style={{ minWidth: '200px' }}
          {...opt}
        />
      );
    },
    [SCHEMA_RANGE_PICKER]: ({ opt = {}, key }) => {
      return <RangePicker {...init(key)} {...opt} style={{ minWidth: '200px' }} />;
    },
    [SCHEMA_INPUT]: ({ opt = {}, values, key, name }) => {
      return (
        <Input
          {...init(key)}
          placeholder={`请输入${name}`}
          size="medium"
          style={{ minWidth: '200px' }}
          {...opt}
        />
      );
    },
    [SCHEMA_DATE_PICKER]: ({ opt = {}, key }) => {
      return <DatePicker2 {...init(key)} {...opt} style={{ minWidth: '200px' }} />;
    },
  };

  const renderField = ({ key, type, opt, values, name, fetchData }) => {
    return (
      <div key={name} className="field-block">
        <span className="label">{name}</span>
        <span className="options">{typeMap[type]({ opt: { ...opt, ...fieldOpt[key] }, values, key, name, fetchData }) || null}</span>
      </div>
    );
  };

  const handleSearch = () => {
    onSearch(field.getValues());
  };

  const handleReset = () => {
    field.reset();
    onSearch(field.getValues());
  };

  useEffect(() => {
    const { fieldInstance = () => { } } = props;
    fieldInstance(field);
  }, []);

  return (
    <div className="searchFilter">
      <Row gutter={16} justify="start" wrap>
        {filters?.map((filter) => {
          return (
            <Col l={8} xl={6} key={filter.name}>
              {renderField(filter)}
            </Col>
          );
        })}
        {
        showSearchAction ? (
          <Col l={{ span: 8, offset: (((3 - (filters?.length % 3)) - 1) * 8) }} xl={{ span: 6, offset: (((4 - (filters?.length % 4)) - 1) * 6) }}>
            <div className="searchBtnsCol">
              <Button type="primary" style={{ marginLeft: '20px' }} onClick={handleSearch}>查询</Button>
              <Button style={{ marginLeft: '20px' }} onClick={handleReset}>重置</Button>
            </div>
          </Col>
        ) : null
       }
      </Row>

    </div>
  );
};

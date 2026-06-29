import React, { useEffect } from 'react';
import { Field, Grid } from '@alifd/next';
import {
  SCHEMA_SEARCH,
  SCHEMA_CHECKBOX,
  SCHEMA_SELECT_CARDS,
} from '../../contanst';
import RenderField from '../RenderField';
import Button from '@/components/UI/Button';

import './index.scss';

const { Row, Col } = Grid;

function SearchFilter(props) {
  const {
    status = null,
    showSearchAction,
    onSearch = () => {},
    fieldOpt = {},
    schema,
    searchFilterType = '1',
    searchActionSlot,
    extraButtons,
  } = props;
  const filters = schema['filterSchema'](status);

  const field = Field.useField({
    onChange() {
      onSearch(field.getValues());
    },
  });

  const { init } = field;

  const renderField = ({ key, type, opt, values, name, fetchData, cardsData }) => {
    let otherProps = {};

    if (type === SCHEMA_SEARCH) {
      otherProps = {
        onSearch: (val) => {
          field.setValue(key, val);
          opt?.onSearch && onSearch(field.getValues());
        },
      };
    }
    return (
      <div key={name} className="field-block">
        {type !== SCHEMA_CHECKBOX && name && <span className={`${searchFilterType === '2' ? '' : 'label'}`}>{name}</span>}
        <span className="options">
          <RenderField
            fieldKey={key}
            type={type}
            opt={{ ...opt, ...fieldOpt[key] }}
            values={values}
            name={name}
            fetchData={fetchData}
            fieldInit={init}
            {...otherProps}
            field={field}
            cardsData={cardsData}
          />
        </span>
      </div>
    );
  };

  const renderButtons = (buttonType) => {
    const searchButtonStyle =
      buttonType === 'searchBtnsCol'
        ? { marginLeft: '20px', borderRadius: '6px', width: '62px' }
        : { borderRadius: '6px', width: '62px' };
    return (
      // <div className="flex justify-between w-[100%]">
      <div>
        <Button style={searchButtonStyle} type="normal:primary-ghost" onClick={handleSearch}>
          筛选
        </Button>
        <Button
          style={{ marginLeft: '12px', borderRadius: '6px', width: '62px' }}
          onClick={handleReset}
          className="rounded-[6px]"
        >
          清空
        </Button>
      </div>
      // </div>
    );
  };

  const handleSearch = () => {
    onSearch(field.getValues());
  };

  const handleReset = () => {
    field.reset();
    onSearch(field.getValues());
  };

  const handleSetValue = (values) => {
    field.setValues(values);
    onSearch(field.getValues());
  };

  useEffect(() => {
    const { fieldInstance = () => {} } = props;
    field._setValue = handleSetValue;
    fieldInstance(field);
  }, []);

  // console.log('[ searchFilterType ] >', searchFilterType);

  const renderFilter = (type) => {
    switch (type) {
      case '1':
        return (
          <Row gutter={16} justify="start" wrap>
            {filters?.map((filter) => {
              return (
                <Col l={8} xl={6} key={filter.name}>
                  {renderField(filter)}
                </Col>
              );
            })}
            {showSearchAction ? (
              <Col
                l={{ span: 8, offset: (3 - (filters?.length % 3) - 1) * 8 }}
                xl={{ span: 6, offset: (4 - (filters?.length % 4) - 1) * 6 }}
              >
                <div className="searchBtnsCol">{renderButtons('searchBtnsCol')}</div>
              </Col>
            ) : null}
          </Row>
        );
      case '2':
        return (
          <div className="flex flex-wrap gap-[20px]">
            {filters?.map((filter) => {
              return <div key={filter.name}>{renderField(filter)}</div>;
            })}
            <div>{renderButtons()}</div>
          </div>
        );
      case '3':
        if (extraButtons) {
          return (
            <div className="flex justify-between">
              <div className="flex gap-[20px]">
                {filters?.map((filter) => (
                  <div key={filter.name}>{renderField(filter)}</div>
                ))}
                <div>{renderButtons()}</div>
              </div>
              {extraButtons}
            </div>
          );
        }
        return (
          <div className="flex justify-between flex-wrap gap-[10px]">
            <div className="flex flex-wrap gap-[10px]">
              {filters?.map((filter) => (
                <div key={filter.name} className="mr-[20px] flex items-center">
                  {renderField(filter)}
                </div>
              ))}
            </div>
            <div className="ml-auto">
              {filters?.length > 0 && showSearchAction ? renderButtons(null, extraButtons) : searchActionSlot}
            </div>
          </div>
        );
      case '4':
        return (
          <div
            className={`flex flex-wrap justify-start ${
              filters.some((f) => f.type === SCHEMA_SELECT_CARDS)
                ? 'gap-[16px]'
                : 'gap-[20px]'
            }`}
          >
            {filters?.map((filter) => (
              <div
                key={filter.name}
                className={`${
                  filter?.type === SCHEMA_SELECT_CARDS ? 'w-[100%]' : ''
                }`}
              >
                {renderField(filter)}
              </div>
            ))}
            {filters.some((f) => f.type === SCHEMA_SELECT_CARDS) ? (
              <div>{renderButtons()}</div>
            ) : (
              <div className="flex-1 text-right">{renderButtons()}</div>
            )}
          </div>
        );
      default:
        break;
    }
  };
  return <div className="searchFilter">{renderFilter(searchFilterType)}</div>;
}
export default SearchFilter;

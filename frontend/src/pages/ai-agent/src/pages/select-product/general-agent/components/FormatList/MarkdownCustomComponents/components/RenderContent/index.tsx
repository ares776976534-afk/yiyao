import ReportContent from '../../../ReportContent';

const renderContent = (_children: any) => {
  if (Array.isArray(_children)) {
    return _children.map((item) => renderContent(item));
  } else if (typeof _children === 'string') {
    return <ReportContent rawData={_children} />;
  } else {
    return null;
  }
};


export default renderContent;
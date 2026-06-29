import type { ComponentProps } from 'react';

import BaseNavButton from './BaseNavButton';

type TypeGlobalProps = Omit<ComponentProps<typeof BaseNavButton>, 'style' | 'className'>;

const Global = (props: TypeGlobalProps) => {
  return <BaseNavButton {...props} style={{ width: 140 }} />;
};

export default Global;

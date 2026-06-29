import type { ComponentProps } from 'react';

import BaseNavButton from './BaseNavButton';

type TypeCnProps = Omit<ComponentProps<typeof BaseNavButton>, 'style' | 'className'>;

const Cn = (props: TypeCnProps) => {
  return <BaseNavButton {...props} />;
};

export default Cn;

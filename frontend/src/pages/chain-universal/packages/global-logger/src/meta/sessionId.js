import { QUERY_SESSIONID } from '../constant';
import getQuery from '../utils/getQuery';
import randomChar from '../utils/randomChar';

export default () => {
  const queryValue = getQuery(QUERY_SESSIONID);
  if (queryValue) return queryValue;
  return randomChar();
};

import * as aeOrder from './aeOrder';

const actions = {
  aeOrder,
};

export default (args) => {
  if (args.group) {
    return actions[args.group][args.name](args.params, args.requestParams);
  }

  return actions[args.name](args.params, args.requestParams);
};

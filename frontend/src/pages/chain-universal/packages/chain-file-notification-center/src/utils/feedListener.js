import { PARENT_TARGET, CHILDREN_TARGET } from '../constants';

class FeedListener {
  constructor(event, callback, target = 'children') {
    this.callback = (e) => {
      const { data = {} } = e;
      const { action, params = {} } = data;
      if (`${target === 'parent' ? PARENT_TARGET : CHILDREN_TARGET}_${event}` === action) {
        callback(params);
      }
    };
    this.on();
  }

  on=() => {
    window.addEventListener('message', this.callback);
  }

  destroy=() => {
    window.removeEventListener('message', this.callback);
  }
}

export default FeedListener;

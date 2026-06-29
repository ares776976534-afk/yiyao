import react from 'react';
import { Dialog } from '@alifd/next';
import PQueue from 'p-queue';
import fatigueService from '@alife/1688-chain-fatigue';

let queueInstance = null;

Dialog.queuePush = ({ queue = {}, ...props }) => {
  if (!queueInstance) {
    queueInstance = new PQueue({ concurrency: 1, autoStart: false });
    queueInstance.on('idle', () => {
      if (queueInstance.pending === 0) {
        queueInstance.clear();
        queueInstance = null;
      }
    })
    Dialog.queue = queueInstance;
  }
  const { priority = 0, show = true, fatigue = false } = queue;

  const dialogQueue = () => {
    if (!show) return;
    queueInstance.add(() => {
      return new Promise((resolve) => {
        let dialog = {};
        dialog.instance = Dialog.show({
          ...props,
          content: props.content ? props.content(dialog) : null,
          onOk: () => {
            props.onOk && props.onOk();
            resolve();
          },
          onCancel: () => {
            props.onCancel && props.onCancel();
            resolve();
          },
        });
      })
    }, { priority })

  }

  if (fatigue && fatigue.key && fatigue.rule) {
    fatigueService.toggle(fatigue.key, {
      rule: fatigue.rule,
    })
      .then((res) => {
        const { success, valid } = res;
        if (success && valid) {
          dialogQueue();
        }
      })
  } else {
    dialogQueue();
  }
}

export default Dialog;
import * as rrweb from 'rrweb'
import "rrweb-player/dist/style.css";
import lzString from "lz-string";
import "./modal.css";
import Logger from "../index";
import rrwebPlayer from "rrweb-player";

export default class RrwebRecorder {
  static replayInstance = null;
  constructor(props) {
    this.eventsMatrix = [[]];
    this.stopFn = null;
    this.playerDom = props?.playerDom;
    this.events = null;
  }
  startRecord() {
    const _this = this;
    this.stopFn = rrweb.record({
      emit(event, isCheckout) {
        // isCheckout 是一个标识，告诉你重新制作了快照
        if (isCheckout) {
          // 第五个产生之前，丢弃前2个数据
          if (_this.eventsMatrix.length >= 4) {
            _this.eventsMatrix.splice(0, 2);
          }
          _this.eventsMatrix.push([]);
        }
        const lastEvents = _this.eventsMatrix[_this.eventsMatrix.length - 1];
        lastEvents.push(event);
      },
      checkoutEveryNms: 2 * 60 * 1000, // 每2分钟重新制作快照
      sampling: {
        // 不录制鼠标移动事件
        mousemove: false,
        // 不录制鼠标交互事件
        mouseInteraction: false,
        // 设置滚动事件的触发频率
        scroll: 500, // 每 150ms 最多触发一次
        // set the interval of media interaction event
        media: 800,
        // 设置输入事件的录制时机
        input: "last", // 连续输入时，只录制最终值
      },
    });
  }
  // 在发生错误的时候，调用saveRecord函数
  saveRecord(err) {
    setTimeout(() => {
      const len = this.eventsMatrix.length;
      let deleteCount = len - 2;
      if (len < 2) {
        this.events = this.eventsMatrix[0];
        deleteCount = 0;
      } else {
        // 传送最新的两个 event 数组
        this.events = this.eventsMatrix[len - 2].concat(
          this.eventsMatrix[len - 1]
        );
      }
      // 丢弃前面的数据
      this.eventsMatrix.splice(0, deleteCount);
      const body = JSON.stringify({ events: this.events });
      const zip_body = lzString.compressToBase64(body);
      window.zip_body = zip_body;
      Logger.reportToSls(zip_body, err);
    }, 2000);
  }
  replayRecord() {
    RrwebRecorder.replayRecord({
      events: this.events,
      playerDom: this.playerDom,
      isStatic: false,
    });
  }
  static replayRecord({ events, playerDom, isStatic = true }) {
    // 有events代表是static状态， 否则需实例化
    const _events = isStatic
      ? JSON.parse(lzString.decompressFromBase64(events)).events
      : events;
    const _playerDom = playerDom;
    if (_events && !_playerDom) {
      RrwebRecorder.render();
    }
    setTimeout(() => {
      if (_events) {
        if (RrwebRecorder.replayInstance) {
          const parentNode = document.getElementById("modal-player")
          RrwebRecorder.replayInstance.getReplayer().destroy()
          parentNode.removeChild(parentNode.firstChild);
          RrwebRecorder.replayInstance = null;
        }
        RrwebRecorder.replayInstance = new rrwebPlayer({
          target: _playerDom || document.getElementById("modal-player"),
          // 配置项
          props: {
            events: _events,
          },
        });
        RrwebRecorder.replayInstance.play();
      }
    }, 1);
  }
  pauseRecord() {
    if (RrwebRecorder.replayInstance) {
      RrwebRecorder.replayInstance.pause();
    }
  }
  stopRecord() {
    this.stopFn();
  }
  static render() {
    let targetNode = document.getElementById("modal-player");
    if (targetNode) {
      targetNode.parentNode.style.display = "flex";
      return;
    }
    // 创建遮罩层和弹窗元素
    const modalMask = document.createElement("div");
    modalMask.classList.add("modal-mask");
    const modalDialog = document.createElement("div");
    modalDialog.classList.add("modal-dialog");
    modalDialog.id = "modal-player";

    modalMask.appendChild(modalDialog);
    document.body.appendChild(modalMask);
    // 关闭弹窗的函数
    const closeModal = () => {
      modalMask.style.display = "none";
    };
    modalMask.addEventListener("click", function (e) {
      if (e.target === modalMask) {
        // 点击遮罩层关闭弹窗
        closeModal();
      }
    });
  }
}

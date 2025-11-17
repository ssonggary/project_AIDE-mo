import * as fn from "./utils/functions.js";
import { TextField } from "./components/textfield.js";
import { ModalManager } from "./components/modal.js";
import { Toast } from "./components/toast.js";
import { ProgressBar, initProgressBars } from "./components/progress.js";

const UI = {
  textField: {
    init() {
      const list = document.querySelectorAll('[data-js="textField"]');
      if (!list.length) return;

      list.forEach((el) => {
        new TextField(el);
      });
    },
  },

  progressBar: {
    init() {
      // 모든 data-js-progress 자동 스캔해서 ProgressBar 적용
      initProgressBars();
    },
  },

  modal: null,
  toast: null,

  init() {
    // 1) 인풋
    this.textField.init();

    // 2) 프로그레스 바 INIT 추가
    this.progressBar.init();

    // 3) vh 라벨 적용
    if (typeof fn.setViewPortHeight === "function") fn.setViewPortHeight();

    // 4) 모달
    this.modal = new ModalManager({
      alertDimClose: false,
    });
    this.modal.bindByDataAttr();

    // 5) 토스트
    this.toast = new Toast({ position: "bottom", duration: 2000, max: 1 });
    this.toast.bindByDataAttr();
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => UI.init(), { once: true });
} else {
  UI.init();
}

export default UI;

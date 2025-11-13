import * as fn from "./utils/functions.js";
import { TextField } from "./components/textfield.js";
import { ModalManager } from "./components/modal.js";
import { Toast } from "./components/toast.js";

const UI = {
  textField: {
    init() {
      this.list = document.querySelectorAll('[data-js="textField"]');
      if (this.list.length) this.list.forEach((el) => new TextField(el));
    },
  },
  modal: null,

  init() {
    this.textField.init();
    if (typeof fn.setViewPortHeight === "function") fn.setViewPortHeight();
    this.modal = new ModalManager({
      alertDimClose: false,
    });

    this.modal.bindByDataAttr();

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

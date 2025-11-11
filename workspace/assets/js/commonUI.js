import * as fn from "./utils/functions.js";
import { TextField } from "./components/textfield.js";

const UI = {
  textField: {
    init() {
      this.list = document.querySelectorAll('[data-js="textField"]');
      if (this.list.length) this.list.forEach((el) => new TextField(el));
    },
  },
  init() {
    this.textField.init();
    if (typeof fn.setViewPortHeight === "function") fn.setViewPortHeight();
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => UI.init(), { once: true });
} else {
  UI.init();
}

export default UI;

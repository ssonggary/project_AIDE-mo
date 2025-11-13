import * as fn from "../utils/functions.js";

export class TextField {
  constructor(el) {
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    this.input = this.el?.querySelector('[data-js="textField__input"]') || null;
    this.clearBtn = this.el?.querySelector('[data-js="textField__clear"]') || null;
    this.toggleBtn = this.el?.querySelector('[data-js="textField__password"]') || null;

    // 이벤트 핸들러 참조 (removeEventListener 용)
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onClear = this._onClear.bind(this);
    this._onToggle = this._onToggle.bind(this);

    this.init();
  }

  init() {
    if (!this.el || !this.input) return;

    // 1) 초기 상태를 function.js의 유틸로 설정
    fn.setInitShapeInput({
      el: this.el,
      input: this.input,
      clearBtn: this.clearBtn,
    });

    if (this.toggleBtn) {
      const has = this.input.value.trim().length > 0;
      this.toggleBtn.style.display = this.originalType === "password" && has ? "" : "none";
    }

    // 2) 이벤트 바인딩
    this._bind();
  }

  _bind() {
    this.input.addEventListener("focus", this._onFocus);
    this.input.addEventListener("blur", this._onBlur);
    this.input.addEventListener("input", this._onInput);

    if (fn.isEl?.(this.clearBtn) ?? !!this.clearBtn) {
      this.clearBtn.addEventListener("click", this._onClear);
    }
    if (fn.isEl?.(this.toggleBtn) ?? !!this.toggleBtn) {
      this.toggleBtn.addEventListener("click", this._onToggle);
    }
  }

  _onFocus() {
    this.el.classList.add("is-focus");
  }

  _onBlur() {
    this.el.classList.remove("is-focus");
  }

  _onInput() {
    const has = this.input.value.trim().length > 0;
    if (has) {
      this.el.classList.add("is-value");
      if (this.clearBtn) this.clearBtn.style.display = "";
    } else {
      this.el.classList.remove("is-value");
      if (this.clearBtn) this.clearBtn.style.display = "none";
    }

    if (this.toggleBtn) this.toggleBtn.style.display = this.originalType === "password" && has ? "" : "none";

    if (!has) this._restoreOriginalType();
  }

  _onClear() {
    this.resetValue();
    this.input.focus();
  }

  _onToggle() {
    if (this.originalType !== "password") return;
    const start = this.input.selectionStart;
    const end = this.input.selectionEnd;

    if (this.input.type === "password") {
      this._setTextType(); // 보이기
    } else {
      this._setPasswordType(); // 가리기
    }

    this.input.focus();
    try {
      this.input.setSelectionRange(start, end);
    } catch (_) {}
  }

  /* helpers for toggle */
  _setTextType() {
    if (this.originalType !== "password") return;
    this.input.type = "text";
    this.el.classList.add("is-pw-visible");
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute("aria-pressed", "true");
      this._setToggleLabel("비밀번호 숨기기");
    }
  }

  _setPasswordType() {
    if (this.originalType !== "password") return;
    this.input.type = "password";
    this.el.classList.remove("is-pw-visible");
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute("aria-pressed", "false");
      this._setToggleLabel("비밀번호 보기");
    }
  }

  _setToggleLabel(txt) {
    if (!this.toggleBtn) return;
    this.toggleBtn.setAttribute("aria-label", txt);
  }

  _restoreOriginalType() {
    this.input.type = this.originalType || "text";
    if (this.originalType !== "password") {
      this.el.classList.remove("is-pw-visible");
    }
  }

  resetValue() {
    this.input.value = "";
    this.el.classList.remove("is-value");
    if (this.clearBtn) this.clearBtn.style.display = "none";
    if (this.toggleBtn) this.toggleBtn.style.display = "none";
    this._restoreOriginalType();
  }

  destroy() {
    if (!this.input) return;
    this.input.removeEventListener("focus", this._onFocus);
    this.input.removeEventListener("blur", this._onBlur);
    this.input.removeEventListener("input", this._onInput);
    if (this.clearBtn) this.clearBtn.removeEventListener("click", this._onClear);
    if (this.toggleBtn) this.toggleBtn.removeEventListener("click", this._onToggle);
  }
}

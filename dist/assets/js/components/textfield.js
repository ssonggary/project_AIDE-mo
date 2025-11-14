import * as fn from "../utils/functions.js";

export class TextField {
  constructor(el) {
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    this.input = this.el?.querySelector('[data-js="textField__input"]') || null;
    this.clearBtn = this.el?.querySelector('[data-js="textField__clear"]') || null;
    this.toggleBtn = this.el?.querySelector('[data-js="textField__password"]') || null;

    // 이벤트 핸들러 바인딩 (removeEventListener용)
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onInput = this._onInput.bind(this);
    this._onClear = this._onClear.bind(this);
    this._onToggle = this._onToggle.bind(this);

    // 내부 헬퍼 (보이기/숨기기)
    this._show = (el, display = "inline-flex") => {
      if (el) el.style.display = display;
    };
    this._hide = (el) => {
      if (el) el.style.display = "none";
    };

    this.originalType = null; // 초기 타입 보관
    this.isPasswordField = false;

    this.init();
  }

  init() {
    if (!this.el || !this.input) return;

    // 1) 초기 상태 세팅 (프로젝트 유틸)
    fn.setInitShapeInput({
      el: this.el,
      input: this.input,
      clearBtn: this.clearBtn,
      // inputWrap 필요하면 전달: inputWrap: this.el.querySelector('.textField__input-wrap')
    });

    // 2) 원래 타입 보관 및 password 여부 플래그
    this.originalType = this.input.type || "text";
    this.isPasswordField = this.originalType === "password";

    // 3) 초기 버튼 가시성
    const has = this.input.value.trim().length > 0;

    // 클리어 버튼(옵션)
    if (fn.isEl(this.clearBtn)) {
      has ? this._show(this.clearBtn) : this._hide(this.clearBtn);
    }

    // 토글 버튼(옵션) — password 필드일 때만, 값이 있을 때 노출
    if (fn.isEl(this.toggleBtn)) {
      if (this.isPasswordField && has) this._show(this.toggleBtn);
      else this._hide(this.toggleBtn);
      // 초기 ARIA
      this.toggleBtn.setAttribute("aria-pressed", "false");
      this.toggleBtn.setAttribute("aria-label", "비밀번호 보기");
    }

    // 4) 이벤트 바인딩
    this._bind();
  }

  _bind() {
    this.input.addEventListener("focus", this._onFocus);
    this.input.addEventListener("blur", this._onBlur);
    this.input.addEventListener("input", this._onInput);

    if (fn.isEl(this.clearBtn)) {
      this.clearBtn.addEventListener("click", this._onClear);
    }
    if (fn.isEl(this.toggleBtn)) {
      this.toggleBtn.addEventListener("click", this._onToggle);
    }
  }

  /* events */
  _onFocus() {
    this.el.classList.add("is-focus");
  }

  _onBlur() {
    this.el.classList.remove("is-focus");
  }

  _onInput() {
    const has = this.input.value.trim().length > 0;

    // value 상태 클래스 & 클리어 버튼
    this.el.classList.toggle("is-value", has);
    if (fn.isEl(this.clearBtn)) {
      has ? this._show(this.clearBtn) : this._hide(this.clearBtn);
    }

    // 토글 버튼은 password 필드에서만, 값이 있을 때만 노출
    if (fn.isEl(this.toggleBtn)) {
      this.isPasswordField && has ? this._show(this.toggleBtn) : this._hide(this.toggleBtn);
    }

    // 값이 비면 원래 타입으로 복구 (text는 text 유지, password는 password 유지)
    if (!has) this._restoreOriginalType();
  }

  _onClear() {
    this.resetValue();
    this.input.focus();
  }

  _onToggle() {
    // password 전용 + 토글 버튼이 있을 때만 동작
    if (!this.isPasswordField || !fn.isEl(this.toggleBtn)) return;

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
    if (!this.isPasswordField) return;
    this.input.type = "text";
    this.el.classList.add("is-pw-visible");
    if (fn.isEl(this.toggleBtn)) {
      this.toggleBtn.setAttribute("aria-pressed", "true");
      this._setToggleLabel("비밀번호 숨기기");
    }
  }

  _setPasswordType() {
    if (!this.isPasswordField) return;
    this.input.type = "password";
    this.el.classList.remove("is-pw-visible");
    if (fn.isEl(this.toggleBtn)) {
      this.toggleBtn.setAttribute("aria-pressed", "false");
      this._setToggleLabel("비밀번호 보기");
    }
  }

  _setToggleLabel(txt) {
    if (!fn.isEl(this.toggleBtn)) return;
    this.toggleBtn.setAttribute("aria-label", txt);
  }

  _restoreOriginalType() {
    this.input.type = this.originalType || "text";
    if (!this.isPasswordField) {
      this.el.classList.remove("is-pw-visible");
    }
  }

  // public
  resetValue() {
    this.input.value = "";
    this.el.classList.remove("is-value");
    if (fn.isEl(this.clearBtn)) this._hide(this.clearBtn);
    if (fn.isEl(this.toggleBtn)) this._hide(this.toggleBtn);
    this._restoreOriginalType();
  }

  destroy() {
    if (!this.input) return;
    this.input.removeEventListener("focus", this._onFocus);
    this.input.removeEventListener("blur", this._onBlur);
    this.input.removeEventListener("input", this._onInput);
    if (fn.isEl(this.clearBtn)) this.clearBtn.removeEventListener("click", this._onClear);
    if (fn.isEl(this.toggleBtn)) this.toggleBtn.removeEventListener("click", this._onToggle);
  }
}

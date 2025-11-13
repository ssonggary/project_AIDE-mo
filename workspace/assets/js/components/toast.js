import * as fn from "../utils/functions.js";

export class Toast {
  /**
   * @param {Object} opts
   * @param {'bottom'|'top'} [opts.position='bottom']
   * @param {number} [opts.duration=2000]
   * @param {number} [opts.max=1]
   */
  constructor(opts = {}) {
    this.position = opts.position ?? "bottom";
    this.duration = opts.duration ?? 2000;
    this.max = opts.max ?? 1;

    this.container = this._ensureContainer();
    this.queue = [];
    this.active = new Set();

    // iOS 키보드/홈바 대응: visualViewport 기반 하단 inset 반영
    const vw = window.visualViewport;
    if (vw) {
      const update = () => this._applyInset();
      vw.addEventListener("resize", update);
      vw.addEventListener("scroll", update);
      window.addEventListener("orientationchange", update);
    }
    this._applyInset();
  }

  _ensureContainer() {
    let el = document.querySelector('[data-js="toast-container"]');
    if (fn.isEl(el)) return el;

    el = document.createElement("div");
    el.setAttribute("data-js", "toast-container");
    el.className = `toast-container toast-container--${this.position}`;
    document.body.appendChild(el);
    return el;
  }

  _applyInset() {
    const vw = window.visualViewport;
    const keyboardOffset = vw ? Math.max(0, window.innerHeight - vw.height - vw.offsetTop) : 0;
    const base = 12; // 기본 여백
    this.container.style.setProperty(
      "--toast-bottom-offset",
      `calc(env(safe-area-inset-bottom) + ${keyboardOffset + base}px)`
    );
  }

  /**
   * @param {string} message
   * @param {{type?: 'default'|'success'|'error'|'warning', duration?: number}} [opt]
   */
  show(message, opt = {}) {
    this.queue.push({
      message,
      type: opt.type || "default",
      duration: Number.isFinite(opt.duration) ? opt.duration : this.duration,
    });
    this._drain();
  }

  // [data-js="toast"] 트리거 지원
  bindByDataAttr({ trigger = '[data-js="toast"]' } = {}) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(trigger);
      if (!fn.isEl(btn)) return;

      const msg = btn.getAttribute("data-text") || "완료되었습니다";
      const type = btn.getAttribute("data-type") || "default";

      // duration 안전 파싱
      const durAttr = btn.getAttribute("data-duration");
      const duration = durAttr !== null && durAttr !== "" ? Number(durAttr) : undefined;

      // position 정규화 (top만 top, 나머지는 bottom)
      const posAttr = btn.getAttribute("data-position");
      const position = posAttr === "top" ? "top" : "bottom";

      // 컨테이너 위치 클래스 교체
      if (this.container) {
        this.container.classList.remove("toast-container--top", "toast-container--bottom");
        this.container.classList.add(`toast-container--${position}`);
      }

      this.show(msg, { type, duration });
    });
  }

  _drain() {
    while (this.active.size < this.max && this.queue.length) {
      const item = this.queue.shift();
      const el = this._render(item);
      this.active.add(el);
      this.container.appendChild(el);

      // show 애니메이션
      requestAnimationFrame(() => el.classList.add("is-show"));

      const close = () => {
        el.classList.remove("is-show");
        el.classList.add("is-hide");
        setTimeout(() => {
          el.remove();
          this.active.delete(el);
          this._drain();
        }, 250); // CSS 전환시간과 맞춤
      };

      const timer = setTimeout(close, item.duration);

      // 유저 탭으로 즉시 닫기
      el.addEventListener("click", () => {
        clearTimeout(timer);
        close();
      });
    }
  }

  _render({ message, type }) {
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `
      <div class="toast__inner">
        <span class="toast__text">${message}</span>
      </div>
    `;
    return el;
  }
}

export default Toast;

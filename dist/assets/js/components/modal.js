import * as fn from "../utils/functions.js";

export class ModalManager {
  /**
   * @param {Object} opts
   * @param {string}  [opts.bodyLockClass="js-noscroll"]
   * @param {number}  [opts.alertOpenDelay=80]
   * @param {number}  [opts.fullOpenDelay=200]
   * @param {number}  [opts.fullCloseDelay=300]
   * @param {boolean} [opts.alertDimClose=true]
   */
  constructor(opts = {}) {
    this.body = document.body;
    this.bodyLockClass = opts.bodyLockClass ?? "js-noscroll";
    this.alertOpenDelay = opts.alertOpenDelay ?? 80;
    this.fullOpenDelay = opts.fullOpenDelay ?? 200;
    this.fullCloseDelay = opts.fullCloseDelay ?? 300;
    this.alertDimClose = opts.alertDimClose ?? true;
    this.stack = [];
  }

  // "#id" | "id" | Element → "id"
  _normalizeId(target) {
    if (!target) return null;
    if (typeof target === "string") return target.replace(/^#/, "");
    if (target instanceof Element) return target.id || null;
    return null;
  }

  _isAlert(host) {
    return host.matches(".alert, [data-role='alert']");
  }
  _isFullPage(host) {
    return host.matches(".fullpage, [data-role='fullpage']");
  }

  open(target, { event = null } = {}) {
    if (event?.preventDefault) event.preventDefault();

    const id = this._normalizeId(target);
    if (!id) return;

    const host = document.getElementById(id);
    if (!fn.isEl(host)) return;

    const isAlert = this._isAlert(host);
    const isFullPage = this._isFullPage(host);

    // 스크롤 잠금
    fn.preventScroll(this.body);

    // 스택 관리
    this.stack.push(id);

    // 표시 + 애니메이션 트리거
    host.hidden = false;
    host.style.display = "block";

    const openDelay = isAlert ? this.alertOpenDelay : isFullPage ? this.fullOpenDelay : 0;

    window.setTimeout(() => {
      host.classList.add("is-open");
    }, openDelay);
  }

  close(target) {
    const id = this._normalizeId(target);
    if (!id) return;

    const host = document.getElementById(id);
    if (!fn.isEl(host)) return;

    const isFullPage = this._isFullPage(host);
    host.classList.remove("is-open");

    const finalize = () => {
      host.style.display = "none";
      host.hidden = true;

      // 스택 정리 및 스크롤락 해제
      this.stack = this.stack.filter((x) => x !== id);
      if (this.stack.length === 0) fn.allowScroll(this.body);
    };

    if (isFullPage) {
      window.setTimeout(finalize, this.fullCloseDelay);
    } else {
      finalize();
    }
  }

  /**
   * 데이터 속성 트리거 바인딩(선택)
   * - [data-js="modal-open"]  data-target="#id"
   * - [data-js="modal-close"] data-target="#id"
   * - 알럿 dim 닫기: .alert__dim[data-js="modal-dim"]
   */
  bindByDataAttr({
    openSelector = '[data-js="modal-open"]',
    closeSelector = '[data-js="modal-close"]',
    dimSelector = '[data-js="modal-dim"]',
  } = {}) {
    document.addEventListener("click", (e) => {
      const opener = e.target.closest(openSelector);
      if (opener) {
        const target = opener.getAttribute("data-target");
        this.open(target, { event: e });
        return;
      }

      const closer = e.target.closest(closeSelector);
      if (closer) {
        const target = closer.getAttribute("data-target");
        this.close(target);
        return;
      }

      const dim = e.target.closest(dimSelector);
      if (dim) {
        const host = dim.closest(".alert, [data-role='alert'], .fullpage, [data-role='fullpage']");
        if (!fn.isEl(host)) return;
        if (this._isAlert(host) && this.alertDimClose) {
          this.close("#" + host.id);
        }
      }
    });
  }
}

export default ModalManager;

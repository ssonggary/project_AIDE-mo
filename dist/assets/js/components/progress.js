import * as fn from "../utils/functions.js";

export class ProgressBar {
  constructor(el, options = {}) {
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    if (!fn.isEl(this.el)) return;

    // 요소 캐싱
    this.track = this.el.querySelector("[data-js-progress-track]");
    this.bar = this.el.querySelector("[data-js-progress-bar]");
    this.thumb = this.el.querySelector("[data-js-progress-thumb]");

    if (!fn.isEl(this.track) || !fn.isEl(this.bar) || !fn.isEl(this.thumb)) {
      return;
    }

    // data- 속성 + options 병합
    const { progressPercent, progressDuration, progressScroll } = this.el.dataset;

    this.targetPercent = options.percent ?? (progressPercent !== undefined ? parseFloat(progressPercent) : 0);

    this.duration = options.duration ?? (progressDuration !== undefined ? parseInt(progressDuration, 10) : 1500);

    this.startOnScroll = options.startOnScroll ?? (progressScroll !== undefined ? progressScroll === "true" : false);

    // 상태값
    this.currentPercent = 0;
    this.isPlaying = false;
    this.hasPlayedOnce = false; // 한 번만 재생할지 여부
    this._rafId = null;

    // 바인딩
    this._onIntersection = this._onIntersection.bind(this);

    this._init();
  }

  /* 초기화 */
  _init() {
    // 기본 UI 0% 상태
    this._updateUI(0);

    if (this.startOnScroll) {
      this._initObserver();
    } else {
      this.play();
    }
  }

  /* IntersectionObserver 초기화 */
  _initObserver() {
    if (!("IntersectionObserver" in window)) {
      // 지원 안 하면 그냥 재생
      this.play();
      return;
    }

    this.observer = new IntersectionObserver(this._onIntersection, {
      threshold: 0.4, // 40% 이상 보일 때
    });

    this.observer.observe(this.el);
  }

  _onIntersection(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (this.hasPlayedOnce) return; // 한 번만 재생

      // 실제로 화면 상에서도 보이는지만 한번 더 체크 (isBlock 활용)
      if (!fn.isBlock(this.el)) return;

      this.play();
    });
  }

  /* 애니메이션 시작 */
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.hasPlayedOnce = true;

    const from = 0;
    const to = this._clamp(this.targetPercent, 0, 100);
    const duration = this.duration;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1); // 0~1
      const eased = this._easeOutCubic(progress);
      const value = from + (to - from) * eased;

      this.currentPercent = value;
      this._updateUI(value);

      if (progress < 1) {
        this._rafId = requestAnimationFrame(tick);
      } else {
        this.isPlaying = false;
        this._rafId = null;
      }
    };

    this._rafId = requestAnimationFrame(tick);
  }

  /* 0%로 리셋 */
  reset() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.isPlaying = false;
    this.currentPercent = 0;
    this._updateUI(0);
  }

  /* 퍼센트 수동 세팅 */
  setProgress(percent) {
    const value = this._clamp(percent, 0, 100);
    this.currentPercent = value;
    this._updateUI(value);
  }

  /* 실제 DOM 스타일 업데이트 */
  _updateUI(percent) {
    const value = this._clamp(percent, 0, 100);
    this.bar.style.width = `${value}%`;
    this.thumb.style.left = `${value}%`;
  }

  /* 공통 유틸 (없어서 내부에 둠) */
  _clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}

/**
 * 페이지 전체 초기화 헬퍼
 * - 기존 TextField init이랑 같은 패턴으로 사용 가능
 */
export function initProgressBars(selector = "[data-js-progress]") {
  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    new ProgressBar(el);
  });
}

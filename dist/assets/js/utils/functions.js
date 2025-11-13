/* is~ : Boolean 값을 return 합니다. */
// input/textarea에 값이 있는지
export function isValue(el) {
  if (!el) return false;
  // input/textarea/hidden 기준
  if ("value" in el) return String(el.value || "") !== "";
  // 그 외 엘리먼트는 텍스트 기준
  return (el.textContent || "").trim() !== "";
}

// disabled 여부
export function isDisabled(el) {
  return !!(el && el.disabled === true);
}

// readonly 여부
export function isReadOnly(el) {
  return !!(el && el.readOnly === true);
}

// element 존재 여부
export function isEl(el) {
  return !!el;
}

// display/visibility 기준 보임 여부 (jQuery :visible 유사)
export function isBlock(el) {
  if (!el) return false;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  // layout 상 보이는지(크기/좌표)
  const rects = el.getClientRects();
  return rects.length > 0;
}

/* ------ viewport ------ */
export function setViewPortHeight() {
  const apply = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  apply();
  window.addEventListener("resize", apply, { passive: true });
  window.addEventListener("orientationchange", apply, { passive: true });
}

/* ------ scroll lock ------ */
export function preventScroll(target = document.documentElement) {
  target.classList.add("js-noscroll");
}
export function allowScroll(target = document.documentElement) {
  target.classList.remove("js-noscroll");
}

/* ------ namespace(그대로 유지 — 바닐라 이벤트 네임스페이스 대체용) ------ */
export function makeNameSpace(events, NAMESPACE) {
  const eventGroup = String(events).split(" ");
  return eventGroup.map((item) => `${item}.${NAMESPACE}`).join(" ");
}

/* ------ 날짜 포맷 ------ */
// moment가 있으면 moment 사용, 없으면 간단 포맷(YYYY-MM-DD HH:mm:ss 정도)으로 대체
export function changeDateFormat(value, format = "YYYY-MM-DD") {
  // moment/ dayjs 있으면 우선 사용
  if (typeof window !== "undefined" && window.moment) {
    return window.moment(value).format(format);
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";

  const pad2 = (n) => String(n).padStart(2, "0");
  const map = {
    YYYY: d.getFullYear(),
    MM: pad2(d.getMonth() + 1),
    DD: pad2(d.getDate()),
    HH: pad2(d.getHours()),
    mm: pad2(d.getMinutes()),
    ss: pad2(d.getSeconds()),
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (t) => map[t] ?? t);
}

// (이름은 isInvalidDate지만, 기존 코드와 동일하게 "유효하면 true" 반환을 유지)
export function isInvalidDate(target, format = "YYYY-MM-DD") {
  return changeDateFormat(target, format) !== "Invalid date";
}

/* ------ 입력 UI 초기 셰이프 ------ */
// jQuery 버전의 시그니처를 바닐라로 유지합니다.
export function setInitShapeInput({ el, input, clearBtn, inputWrap }) {
  // value가 있을 때
  if (isValue(input)) {
    el && el.classList.add("is-value");
    if (isEl(clearBtn)) clearBtn.style.display = "";
    if (inputWrap) inputWrap.classList.add("is-value");
  } else {
    el && el.classList.remove("is-value");
    if (isEl(clearBtn)) clearBtn.style.display = "none";
    if (inputWrap) inputWrap.classList.remove("is-value");
  }

  // disabled
  if (isDisabled(input)) {
    el && el.classList.add("is-disabled");
    if (isEl(clearBtn)) clearBtn.style.display = "none";
    if (inputWrap) inputWrap.classList.add("is-disabled");
  } else {
    el && el.classList.remove("is-disabled");
    if (inputWrap) inputWrap.classList.remove("is-disabled");
  }

  // readonly
  if (isReadOnly(input)) {
    el && el.classList.add("is-readonly");
    if (isEl(clearBtn)) clearBtn.style.display = "none";
    if (inputWrap) inputWrap.classList.add("is-readonly");
  } else {
    el && el.classList.remove("is-readonly");
    if (inputWrap) inputWrap.classList.remove("is-readonly");
  }
}

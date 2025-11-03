const { src, dest, series, watch, parallel, symlink } = require("gulp");
const fileinclude = require("gulp-file-include");
const browserSync = require("browser-sync").create();
const { deleteAsync } = require("del");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");

const PATH = {
    HTML: "./workspace/html",
    GUIDE: "./workspace/guide",
    ASSETS: {
      FONTS: "./workspace/assets/fonts",
      IMAGES: "./workspace/assets/img",
      STYLE: "./workspace/assets/scss",
      JS: "./workspace/assets/js",
      LIB: "./workspace/assets/lib",
    },
  },
  DEST_PATH = {
    HTML: "./dist/html",
    GUIDE: "./dist/guide",
    ASSETS: {
      FONTS: "./dist/assets/fonts",
      IMAGES: "./dist/assets/img",
      STYLE: "./dist/assets/css",
      JS: "./dist/assets/js",
      LIB: "./dist/assets/lib",
    },
  };

function server(cb) {
  browserSync.init({
    server: { baseDir: "./dist" }, // ← dist 기준
    open: false,
    notify: false,
  });
  cb && cb();
}

// server: baseDir는 dist
// browserSync.init({ server: { baseDir: "./dist" }, open: false, notify: false });

function clean() {
  return deleteAsync([
    DEST_PATH.HTML,
    DEST_PATH.GUIDE,
    DEST_PATH.ASSETS.STYLE,
    DEST_PATH.ASSETS.JS,
    DEST_PATH.ASSETS.IMAGES,
    "!dist/assets/fonts/**",
  ]);
}

// function include() {
//   return src(PATH.HTML + "/*.html")
//     .pipe(
//       fileinclude({
//         context: { cssArr: [], jsArr: [] },
//         prefix: "@@",
//         basepath: "@file", // ← 상대 기준
//         indent: true,
//       })
//     )
//     .pipe(dest(DEST_PATH.HTML))
//     .pipe(browserSync.stream());
// }

// guide/html 모두: 부분 파일은 제외하고 빌드
function include() {
  return src([PATH.HTML + "/**/*.html", "!" + PATH.HTML + "/include/**"])
    .pipe(fileinclude({ prefix: "@@", basepath: "@file", indent: true }))
    .pipe(dest(DEST_PATH.HTML));
}

// function guide() {
//   return src(PATH.GUIDE + "/*.html")
//     .pipe(
//       fileinclude({
//         context: { cssArr: [], jsArr: [] },
//         prefix: "@@",
//         basepath: "workspace/html",
//         // basepath: "@file", // ← 상대 기준
//         indent: true,
//       })
//     )
//     .pipe(dest(DEST_PATH.GUIDE))
//     .pipe(browserSync.stream());
// }

function guide() {
  return src([
    PATH.GUIDE + "/**/*.html",
    "!" + PATH.GUIDE + "/include/**",
    "!" + PATH.GUIDE + "/**/*_old.html", // 있으면 제외
  ])
    .pipe(fileinclude({ prefix: "@@", basepath: "@file", indent: true }))
    .pipe(dest(DEST_PATH.GUIDE))
    .on("end", () => browserSync.reload()); // ★ HTML은 reload
}

function style() {
  const options = {
    outputStyle: "expanded",
    indentType: "space",
    indentWidth: 4,
    precision: 8,
    sourceComments: false,
  };
  return (
    src(PATH.ASSETS.STYLE + "/*.scss")
      // .pipe(sourcemaps.init())
      .pipe(sass.sync(options).on("error", sass.logError))
      // .pipe(sourcemaps.write("./map"))
      .pipe(dest(DEST_PATH.ASSETS.STYLE))
      .pipe(browserSync.stream({ match: "**/*.css" }))
    // .pipe(
    //   browserSync.reload({
    //     stream: true,
    //   })
    // )
  );
}

// ✅ js → scripts 로 변경
function scripts() {
  return src(PATH.ASSETS.JS + "/**/*.js")
    .pipe(dest(DEST_PATH.ASSETS.JS))
    .pipe(browserSync.stream());
}

function img() {
  return src(PATH.ASSETS.IMAGES + "/**/*")
    .pipe(dest(DEST_PATH.ASSETS.IMAGES))
    .pipe(browserSync.stream());
}

function watching() {
  watch([PATH.GUIDE + "/**/*.html", "!" + PATH.GUIDE + "/include/**"], guide);
  watch([PATH.GUIDE + "/include/**/*.html"], guide); // partial도 감시
  watch(PATH.HTML + "/**/*.html", include); // ← 각자 감시
  watch(PATH.GUIDE + "/**/*.html", guide);
  watch(PATH.ASSETS.STYLE + "/**/*.scss", style);
  watch(PATH.ASSETS.JS + "/**/*.js", scripts);
  watch(PATH.ASSETS.IMAGES + "/**/*", img);
}

exports.server = server;
exports.clean = clean;
exports.include = include;
exports.guide = guide;
exports.style = style;
exports.scripts = scripts; // ← 이름 반영
exports.img = img;
exports.watching = watching;

const prepare = series(clean);
const assets = series(include, guide, style, scripts, img); // ← [] 제거
const build = series(prepare, assets);
const live = parallel(server, watching);

exports.prepare = prepare;
exports.assets = assets;
exports.build = build;
exports.live = live;
exports.dev = series(build, live);
exports.default = exports.dev;

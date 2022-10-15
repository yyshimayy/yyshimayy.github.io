/*
src 参照元を指定
dest 出力先を指定
watch ファイルを監視する
series(順番に処理)とparallel(同時に処理)
*/
const { src, dest, watch, series, parallel } = require("gulp"); //gulpのメソッドを記述
const rename = require("gulp-rename"); //ファイル名を変える
const plumber = require("gulp-plumber"); //エラーが発生しても処理を続ける
const notify = require("gulp-notify"); //タスクが完了したらメッセージを表示orエラーメッセージを表示

// srcフォルダ
const srcPath = {
  scss: "./src/sass/**/*.scss",
  js: "./src/js/**/*.js",
  img: "./src/images/**/*",
  ejs: "./src/ejs/**/*.ejs",
  ejsExc: "./src/ejs/**/_*.ejs",
};

// destフォルダ
const destPath = {
  all: "./dist/**/*",
  css: "./dist/css/",
  js: "./dist/js/",
  img: "./dist/images/",
  html: "./dist/",
};

// ブラウザーシンク（リアルタイムでブラウザに反映させる処理）
const browserSync = require("browser-sync");
const browserSyncFunc = () => {
  browserSync.init({
    server: "./dist/",
  });
};
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
};

// Sassのコンパイル
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const cssnext = require("postcss-cssnext");
const browsers = [
  //対応ブラウザの指定
  "last 2 versions",
  "> 5%",
  "not ie <= 10",
  "ios >= 8",
  "and_chr >= 5",
  "Android >= 5",
];

const cssSass = () => {
  return src(srcPath.scss)
    .pipe(
      // エラーが起きても処理を続ける
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(sass({ outputStyle: "expanded" })) //出力ファイルの記述方法を記載
    .pipe(postcss([cssnext(browsers)]))
    .pipe(dest(destPath.css))
    .pipe(sass({ outputStyle: "compressed" })) //圧縮する
    .pipe(postcss([cssnext(browsers)]))
    .pipe(rename({ extname: ".min.css" })) //ファイル名を変更
    .pipe(dest(destPath.css))
    .pipe(
      notify({
        message: "Sassのコンパイルが完了",
        onLast: true,
      })
    );
};

//  EJS
const ejs = require("gulp-ejs");
const htmlBeautify = require("gulp-html-beautify");

const ejsCompile = () => {
  // 出力するファイルと出力しないファイルを指定
  return (
    src([srcPath.ejs, "!" + srcPath.ejsExc])
      .pipe(
        // エラーが起きても処理を続ける
        plumber({
          errorHandler: notify.onError("Error:<%= error.message %>"),
        })
      )
      .pipe(ejs({}))
      // 末尾を「.ejs」→「.html」へ
      .pipe(rename({ extname: ".html" }))
      .pipe(
        htmlBeautify({
          // インデントの幅
          indent_size: 2,
          // インデントに使う文字列を指定
          indent_char: " ",
          // ※重要 コンパイル時に改行を無視して整形する
          preserve_newlines: false,
          // head,body,htmlタグの前に改行を入れないようにする
          extra_liners: [],
        })
      )
      .pipe(dest(destPath.html))
  );
};

// JS
const uglify = require("gulp-uglify");
const jsMin = () => {
  return src(srcPath.js)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(dest(destPath.js))
    .pipe(uglify()) //JSファイルを圧縮
    .pipe(rename({ extname: ".min.js" }))
    .pipe(dest(destPath.js));
};

// 画像圧縮
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");

const imageCompression = () => {
  return src(srcPath.img)
    .pipe(
      imagemin(
        [
          mozjpeg({ quality: 80 }), //画質
          pngquant({
            quality: [0.6, 0.7], // 画質
            speed: 1, // スピード
          }),
          imagemin.svgo(),
        ],
        {
          verbose: true, //ログを吐き出す
        }
      )
    )
    .pipe(dest(destPath.img));
};

// ファイルの変更を検知
const watchFiles = () => {
  watch(srcPath.scss, series(cssSass, browserSyncReload));
  watch(srcPath.js, series(jsMin, browserSyncReload));
  watch(srcPath.img, series(imageCompression, browserSyncReload));
  watch(srcPath.ejs, series(ejsCompile, browserSyncReload));
};

// npx gulpで出力する内容
exports.default = series(
  series(cssSass, jsMin, imageCompression, ejsCompile), //順番に処理
  parallel(watchFiles, browserSyncFunc) //同時に処理
);

module.exports = {
  appName: "global-1688-ai-app",
  entry: [
    "src",
  ],
  exclude: [
    "src/**/Icons/**/*.tsx",
    "src/**/Icon/**/*.tsx",
    "src/**/mock.ts",
    "src/**/mock/**/*.ts",
    "src/pages/inquiry/components/FormatList/mock.ts",
    "src/**/usercase/**/*.ts",
  ],
  autoUpload: false,
  autoTransform: false,
  output: [
    ".i18n",
  ],
  ignoreComponents: [
    "q-t",
    "I18nText",
  ],
  ignoreMethods: [
    "$t",
    "report",
    "log",
    "warn",
    "error",
    "commonRecord",
  ],
  i18n: {
    importFrom: "@/i18n",
    method: "$t",
  },
  empId: "238382",
};
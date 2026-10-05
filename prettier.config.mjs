/** @type {import('prettier-plugin-embed').PluginEmbedOptions} */
const embedConfig = {
  embeddedSqlTags: ['sql']
}

/** @type {import('prettier-plugin-sql').SqlBaseOptions} */
const sqlConfig = {
  language: 'postgresql',
  keywordCase: 'upper'
}

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  trailingComma: 'none',
  printWidth: 100,
  singleQuote: true,
  endOfLine: 'lf',
  experimentalTernaries: true,
  plugins: ['prettier-plugin-embed', 'prettier-plugin-sql', 'prettier-plugin-tailwindcss'],
  ...embedConfig,
  ...sqlConfig
}

export default config
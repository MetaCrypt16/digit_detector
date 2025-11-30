interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  // You would add any other VITE_ prefixed variables here later
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
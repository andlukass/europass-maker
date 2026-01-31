declare module 'prompts' {
  function prompts(
    prompts: object | object[],
    options?: { onCancel?: () => void }
  ): Promise<Record<string, unknown>>;
  export default prompts;
}

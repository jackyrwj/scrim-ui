<script>
  export let lang = "";
  export let code = "";
  let copied = false;
  $: lines = code.split("\n");
  function copy() {
    navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => (copied = false), 1200);
  }
</script>

<div class="cb">
  <div class="cb-head">
    <span class="cb-file">
      <svg class="cb-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="m8 6-6 6 6 6M16 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <span class="cb-lang">{lang}</span>
    </span>
    <button class="cb-copy" on:click={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
      {#if copied}
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.75 6 6 9-13.5" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" /></svg>
      {/if}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  </div>
  <div class="cb-body">
  <div class="cb-lines">
    {#each lines as line, i (i)}
      <div class="cb-row">
        <span class="cb-ln">{i + 1}</span>
        <code class="cb-code">{line || '\u00A0'}</code>
      </div>
    {/each}
  </div>
</div>

<style>
/* Theme follows the nearest [data-theme] ancestor, then .dark, then the OS. */
:global(:root),
:global([data-theme="light"]) {
  --cb-bg: #fff;
  --cb-ring: #e6e8ec;
  --cb-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02);
  --cb-fg: #1a1a1a;
  --cb-copy-hover-fg: #1a1a1a;
  --cb-copy-hover-bg: #f4f5f7;
}
:global([data-theme="dark"]),
:global(.dark) {
  --cb-bg: #1a1a1a;
  --cb-ring: #303030;
  --cb-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --cb-fg: #f5f5f5;
  --cb-copy-hover-fg: #f5f5f5;
  --cb-copy-hover-bg: #242424;
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme])) {
  --cb-bg: #1a1a1a;
  --cb-ring: #303030;
  --cb-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --cb-fg: #f5f5f5;
  --cb-copy-hover-fg: #f5f5f5;
  --cb-copy-hover-bg: #242424;
  }
}
.cb { width: 100%; max-width: 100%; border-radius: 12px; background: var(--cb-bg, #fff); box-shadow: var(--cb-shadow, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02)); padding: 12px 16px 16px; overflow: hidden; }
.cb-head { display: flex; align-items: center; gap: 8px; margin: -12px -16px 0; padding: 10px 12px 10px 16px; background: transparent; border-bottom: 0.5px solid var(--cb-ring, #e6e8ec); }
.cb-file { display: inline-flex; align-items: center; gap: 7px; }
.cb-icon { display: block; width: 15px; height: 15px; color: #a1a1a1; flex: none; }
.cb-lang { font-family: ui-monospace, monospace; font-size: 12.5px; line-height: 1; color: var(--cb-fg, #1a1a1a); }
.cb-copy { margin-left: auto; margin-top: -7px; margin-bottom: -7px; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #a1a1a1; border: 0; background: none; padding: 3px 3px 3px 7px; border-radius: 7px; cursor: pointer; }
.cb-copy:hover { color: var(--cb-copy-hover-fg, #1a1a1a); background: var(--cb-copy-hover-bg, #f4f5f7); }
.cb-body { position: relative; margin: 0 -16px -16px; padding: 10px 0; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; -ms-overflow-style: none; font-family: ui-monospace, monospace; font-size: 12.5px; line-height: 20px; }
.cb-body::-webkit-scrollbar { display: none; }
.cb-lines { position: relative; width: max-content; min-width: 100%; }
.cb-lines::before { content: ""; position: absolute; top: 0; bottom: 0; left: 32px; width: 0.5px; background: var(--cb-ring, #e6e8ec); pointer-events: none; }
.cb-row { display: grid; grid-template-columns: 32px 1fr; }
.cb-ln { user-select: none; text-align: right; padding: 0 7px; color: #a1a1a1; font-size: 11px; }
.cb-code { white-space: pre; padding: 0 12px 0 8px; color: var(--cb-fg, #1a1a1a); }

</style>
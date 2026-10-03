<div class="prose"><slot /></div>

<style>
/* Theme follows the nearest [data-theme] ancestor, then .dark, then the OS. */
:global(:root),
:global([data-theme="light"]) {
  --tr-fg: #1a1a1a;
  --tr-code-bg: #f4f5f7;
}
:global([data-theme="dark"]),
:global(.dark) {
  --tr-fg: #f5f5f5;
  --tr-code-bg: #242424;
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme])) {
  --tr-fg: #f5f5f5;
  --tr-code-bg: #242424;
  }
}
.prose { max-width: 100%; font-size: 14px; line-height: 19px; color: var(--tr-fg, #1a1a1a); overflow-wrap: anywhere; }
.prose :global(p) { margin-bottom: 10px; }
.prose :global(p):last-child { margin-bottom: 0; }
.prose :global(code) { font-family: ui-monospace, monospace; font-size: 12.5px; color: inherit; background: var(--tr-code-bg, #f4f5f7); padding: 3px 5px 1px; border-radius: 5px; }
</style>
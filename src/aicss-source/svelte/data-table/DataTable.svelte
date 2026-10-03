<script>
  const OPENAI = "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";
  const ANTHROPIC = "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z";
  const META = "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z";

  export let rows = [
    { model: "gpt-4o", context: "128k", price: "$5.00" },
    { model: "claude-3.5", context: "200k", price: "$3.00" },
    { model: "llama-3.1", context: "128k", price: "$0.90" },
  ];
  const head = ["Model", "Context", "$/1M in"];
  function brandOf(model) {
    if (model.startsWith("gpt")) return { bg: "#10a37f", glyph: OPENAI };
    if (model.startsWith("claude")) return { bg: "#d97757", glyph: ANTHROPIC };
    return { bg: "#0866ff", glyph: META };
  }
</script>

<div class="tbl">
  <div class="tbl-head">
    {#each head as h}<div class="tbl-cell">{h}</div>{/each}
  </div>
  <div class="tbl-body">
    {#each rows as r (r.model)}
      <div class="tbl-row">
        <div class="tbl-cell">
          <span class="model-cell">
            <span class="model-icon" style="background: {brandOf(r.model).bg}">
              <svg viewBox="0 0 24 24" width="9" height="9" fill="currentColor" aria-hidden="true"><path d={brandOf(r.model).glyph} /></svg>
            </span>
            <span class="tbl-cell-text">{r.model}</span>
          </span>
        </div>
        <div class="tbl-cell">{r.context}</div>
        <div class="tbl-cell">{r.price}</div>
      </div>
    {/each}
  </div>
</div>

<style>
/* Theme follows the nearest [data-theme] ancestor, then .dark, then the OS. */
:global(:root),
:global([data-theme="light"]) {
  --tbl-bg: #fafafa;
  --tbl-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.02);
  --tbl-body-bg: #fff;
  --tbl-line: #e6e8ec;
  --tbl-cell: #1a1a1a;
}
:global([data-theme="dark"]),
:global(.dark) {
  --tbl-bg: #242424;
  --tbl-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --tbl-body-bg: #1a1a1a;
  --tbl-line: #303030;
  --tbl-cell: #f5f5f5;
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme])) {
    --tbl-bg: #242424;
    --tbl-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
    --tbl-body-bg: #1a1a1a;
    --tbl-line: #303030;
    --tbl-cell: #f5f5f5;
  }
}
  .tbl { width: 100%; max-width: 100%; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: var(--tbl-bg, #fafafa); box-shadow: var(--tbl-shadow); font-size: 13px; }
  .tbl-head { display: flex; color: #a1a1a1; font-weight: 500; }
  .tbl-head .tbl-cell { padding-top: 7px; padding-bottom: 7px; }
  .tbl-body { display: flex; flex-direction: column; background: var(--tbl-body-bg, #fff); border: 0.5px solid var(--tbl-line, #e6e8ec); border-radius: 12px 12px 0 0; margin: 0 -0.5px -0.5px; }
  .tbl-row { display: flex; }
  .tbl-row:not(:last-child) { border-bottom: 0.5px solid var(--tbl-line, #e6e8ec); }
  .tbl-cell { flex: 1 1 0; min-width: 0; padding: 9px 12px; display: flex; align-items: center; color: var(--tbl-cell, #1a1a1a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tbl-cell:not(:last-child) { border-right: 0.5px solid var(--tbl-line, #e6e8ec); }
  /* text-overflow:ellipsis has no effect on a flex container's raw text, so the
     label lives in this shrinkable child instead. */
  .tbl-cell-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.model-cell { display: flex; min-width: 0; align-items: center; gap: 6px; }
  .model-icon { width: 14px; height: 14px; flex: none; border-radius: 2px; display: inline-flex; align-items: center; justify-content: center; color: #fff; box-shadow: inset 0 0 0 0.5px rgba(0,0,0,0.18); }
</style>
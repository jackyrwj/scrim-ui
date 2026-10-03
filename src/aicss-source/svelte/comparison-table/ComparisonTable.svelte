<script>
  export let plans = ["Personal", "Enterprise"];
  export let features = [
    { label: "Unlimited projects", values: [true, true] },
    { label: "All components", values: [true, true] },
    { label: "Team-wide usage", values: [false, true] },
    { label: "Priority support", values: [false, true] },
  ];
</script>

<div class="tbl">
  <div class="tbl-head">
    <div class="tbl-cell">Feature</div>
    {#each plans as p}<div class="tbl-cell">{p}</div>{/each}
  </div>
  <div class="tbl-body">
    {#each features as f (f.label)}
      <div class="tbl-row">
        <div class="tbl-cell"><span class="tbl-cell-text">{f.label}</span></div>
        {#each f.values as v}
          <div class="tbl-cell">{#if v}<span class="yes">✓</span>{:else}<span class="no">—</span>{/if}</div>
        {/each}
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
    --tbl-yes: #15a06a;
  }
  :global([data-theme="dark"]),
  :global(.dark) {
    --tbl-bg: #242424;
    --tbl-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
    --tbl-body-bg: #1a1a1a;
    --tbl-line: #303030;
    --tbl-cell: #f5f5f5;
    --tbl-yes: #34d399;
  }
  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme])) {
      --tbl-bg: #242424;
      --tbl-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12),
        0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
      --tbl-body-bg: #1a1a1a;
      --tbl-line: #303030;
      --tbl-cell: #f5f5f5;
      --tbl-yes: #34d399;
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
  .yes { color: var(--tbl-yes, #15a06a); }
  .no { color: #a1a1a1; }
</style>
import styles from "./FileDiff.module.css";

const ROWS = [
  { old: 12, cur: 12, type: "ctx", text: "export function getToken() {" },
  { old: 13, cur: null, type: "del", text: "  return localStorage.token;" },
  { old: null, cur: 13, type: "add", text: '  const t = cookies.get("session");' },
  { old: null, cur: 14, type: "add", text: '  if (!t) throw new Error("no session");' },
  { old: null, cur: 15, type: "add", text: "  return t;" },
  { old: 14, cur: 16, type: "ctx", text: "}" },
];

const KEYWORDS = new Set([
  "export","function","return","const","let","var","if","else","throw","new",
  "import","from","async","await","class","extends","typeof","void","true",
  "false","null","undefined","for","while","switch","case","break","continue",
  "try","catch","finally","this","super","static","type","interface","enum","as","of","in",
]);

function tokenize(line: string) {
  const raw = [];
  const re = /(\s+)|(\/\/.*)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)|(\S)/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1]) raw.push({ kind: "txt", v: m[1] });
    else if (m[2] || m[3]) raw.push({ kind: "cm", v: m[0] });
    else if (m[4]) raw.push({ kind: "str", v: m[0] });
    else if (m[5]) raw.push({ kind: "num", v: m[0] });
    else if (m[6]) raw.push({ kind: "id", v: m[0] });
    else raw.push({ kind: "txt", v: m[0] });
  }
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const cur = raw[i];
    if (cur.kind !== "id") { out.push({ t: cur.kind, v: cur.v }); continue; }
    if (KEYWORDS.has(cur.v)) { out.push({ t: "kw", v: cur.v }); continue; }
    let j = i + 1;
    while (j < raw.length && raw[j].kind === "txt" && /^\s+$/.test(raw[j].v)) j++;
    const next = raw[j];
    out.push({ t: next && next.v.startsWith("(") ? "fn" : "txt", v: cur.v });
  }
  return out;
}

export function FileDiff({ file = "src/auth.ts", rows = ROWS }) {
  const added = rows.filter((r) => r.type === "add").length;
  const removed = rows.filter((r) => r.type === "del").length;
  return (
    <div className={styles.diff}>
      <div className={styles.diffHead}>
        <span className={styles.diffFileWrap}>
          <svg className={styles.diffIcon} viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.diffFile}>{file}</span>
        </span>
        <span className={styles.diffStat}>
          <span className={styles.add}>+{added}</span>
          <span className={styles.del}>-{removed}</span>
        </span>
      </div>
      <div className={styles.diffBody}>
        <div className={styles.diffLines}>
        {rows.map((r, i) => (
          <div key={i} className={styles.diffRow + " " + styles[r.type]}>
            <span className={styles.ln + " " + styles.old}>{r.old ?? ""}</span>
            <span className={styles.ln + " " + styles.new}>{r.cur ?? ""}</span>
            <span className={styles.sign}>
              {r.type === "add" ? "+" : r.type === "del" ? "-" : ""}
            </span>
            <code>
              {tokenize(r.text).map((tok, j) => (
                <span key={j} className={tok.t === "txt" ? undefined : tok.t}>{tok.v}</span>
              ))}
            </code>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

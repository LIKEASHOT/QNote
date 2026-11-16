export interface CodeDetectionResult {
  isCode: boolean;
  language: string;
  confidence: number;
}

export interface TableDetectionResult {
  isTable: boolean;
  headers?: string[];
  rows?: string[][];
}

export function detectCode(text: string): CodeDetectionResult {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 15) {
    return { isCode: false, language: 'plaintext', confidence: 0 };
  }

  const lines = trimmed.split('\n');
  const lineCount = lines.length;

  // Signatures
  let javaScore = 0;
  let pythonScore = 0;
  let jsScore = 0;
  let sqlScore = 0;
  let rustScore = 0;

  // Java patterns
  if (/\b(public|private|protected)\s+(static\s+)?(class|interface|void|int|String|boolean|long)\b/.test(text)) javaScore += 4;
  if (/\b(System\.out\.println|import\s+java\.|@Override|synchronized|volatile)\b/.test(text)) javaScore += 4;
  if (/public\s+static\s+void\s+main/.test(text)) javaScore += 6;

  // Python patterns
  if (/^\s*def\s+\w+\s*\(.*?\):/m.test(text)) pythonScore += 5;
  if (/^\s*class\s+\w+(\(.*?\))?:/m.test(text)) pythonScore += 4;
  if (/^\s*(import\s+\w+|from\s+\w+\s+import)/m.test(text)) pythonScore += 4;
  if (/\bself\.\w+/.test(text)) pythonScore += 3;

  // JS / TS patterns
  if (/\b(const|let|var)\s+\w+\s*=\s*/.test(text)) jsScore += 3;
  if (/function\s+\w+\s*\(/.test(text) || /=>\s*\{/.test(text)) jsScore += 3;
  if (/\b(console\.log|export\s+default|export\s+const)\b/.test(text)) jsScore += 4;
  if (/\b(interface|type)\s+[A-Z]\w+\s*=\s*\{/.test(text)) jsScore += 4;

  // SQL patterns
  if (/\b(SELECT\s+.*?\s+FROM|INSERT\s+INTO|UPDATE\s+.*?\s+SET|CREATE\s+TABLE)\b/i.test(text)) sqlScore += 6;

  // Rust patterns
  if (/\b(fn\s+\w+|impl\s+\w+|let\s+mut\s+|match\s+\w+\s*\{)\b/.test(text)) rustScore += 5;

  // General code syntax heuristics (brackets, semicolons, indentations)
  let syntaxWeight = 0;
  if (/[{};]/.test(text)) syntaxWeight += 2;
  if (lines.some((l) => /^\s{2,8}\S/.test(l))) syntaxWeight += 2;

  const maxScore = Math.max(javaScore, pythonScore, jsScore, sqlScore, rustScore);
  const totalScore = maxScore + (lineCount > 2 ? syntaxWeight : 0);

  if (totalScore >= 4) {
    let bestLang = 'plaintext';
    if (javaScore === maxScore) bestLang = 'java';
    else if (pythonScore === maxScore) bestLang = 'python';
    else if (jsScore === maxScore) bestLang = 'typescript';
    else if (sqlScore === maxScore) bestLang = 'sql';
    else if (rustScore === maxScore) bestLang = 'rust';

    return {
      isCode: true,
      language: bestLang,
      confidence: Math.min(100, totalScore * 15),
    };
  }

  return { isCode: false, language: 'plaintext', confidence: 0 };
}

export function detectTable(text: string, html: string): TableDetectionResult {
  // 1. Check HTML table
  if (html && html.includes('<table') && html.includes('</table>')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (table) {
      const rows: string[][] = [];
      const trs = table.querySelectorAll('tr');
      trs.forEach((tr) => {
        const cells: string[] = [];
        tr.querySelectorAll('td, th').forEach((cell) => {
          cells.push(cell.textContent?.trim() || '');
        });
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 1 && rows[0].length > 1) {
        return { isTable: true, rows };
      }
    }
  }

  // 2. Check TSV / tab-delimited text (e.g. from Excel/Sheets copy)
  const lines = text.trim().split('\n');
  if (lines.length >= 2) {
    const tabCounts = lines.map((l) => (l.match(/\t/g) || []).length);
    const hasTabs = tabCounts[0] >= 1 && tabCounts.every((c) => Math.abs(c - tabCounts[0]) <= 1);
    if (hasTabs) {
      const rows = lines.map((l) => l.split('\t').map((c) => c.trim()));
      return { isTable: true, rows };
    }

    // 3. Check Markdown pipe table
    if (lines.some((l) => l.includes('|') && /^\s*\|?.*\|.*\|?\s*$/.test(l))) {
      const nonSeparatorLines = lines.filter((l) => !/^\s*\|?\s*:?-+:?\s*\|/.test(l));
      const rows = nonSeparatorLines.map((l) =>
        l
          .split('|')
          .map((c) => c.trim())
          .filter((c, idx, arr) => (idx === 0 && !c) ? false : (idx === arr.length - 1 && !c) ? false : true)
      );
      if (rows.length >= 2 && rows[0].length >= 2) {
        return { isTable: true, rows };
      }
    }
  }

  return { isTable: false };
}

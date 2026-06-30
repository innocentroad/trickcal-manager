(() => {
  const STATUS_LABELS = [
    "HP",
    "SP",
    "物理攻撃力",
    "魔法攻撃力",
    "物理防御力",
    "魔法防御力",
    "会心",
    "会心DMG",
    "会心抵抗",
    "会心DMG抵抗",
    "初期SP",
    "毎秒SP回復量"
  ];
  const RANK_STAT_LABELS = [
    "HP",
    "物理攻撃力",
    "魔法攻撃力",
    "物理防御力",
    "魔法防御力",
    "会心",
    "会心ダメージ",
    "会心DMG",
    "会心抵抗",
    "会心DMG抵抗"
  ];
  const OUTPUT_HEADERS = ["使徒", "区分", "項目", "Rank", "値", "元テキスト"];

  const normalize = (value) => (value || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pageName = normalize(document.querySelector("h1")?.innerText) || decodeURIComponent(location.pathname.split("/").pop() || "");
  const headingTags = "h2,h3";

  function cellMatchesLabel(label, text) {
    if (!text.includes(label)) return false;
    if (label === "SP") return !text.includes("初期SP") && !text.includes("毎秒SP回復量") && !text.includes("SP回復");
    if (label === "会心") return !text.includes("会心DMG") && !text.includes("会心ダメージ") && !text.includes("会心抵抗");
    return true;
  }

  function findHeading(title) {
    return [...document.querySelectorAll(headingTags)].find((heading) => normalize(heading.innerText).includes(title));
  }

  function collectSectionNodes(title) {
    const heading = findHeading(title);
    if (!heading) return [];
    const nodes = [];
    for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
      if (/^H2$/i.test(node.tagName)) break;
      nodes.push(node);
    }
    return nodes;
  }

  function isMutedStar(textNode) {
    const parent = textNode.parentElement;
    if (!parent) return false;
    const style = getComputedStyle(parent);
    if (Number(style.opacity || "1") < 0.75) return true;
    const color = style.color.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    if (color.length < 3) return false;
    const [r, g, b] = color;
    const grayLike = Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8;
    return grayLike && r >= 120;
  }

  function countActiveStars(root) {
    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const char of node.nodeValue || "") {
        if (char === "★" && !isMutedStar(node)) count += 1;
      }
    }
    return count;
  }

  function readValueElement(element) {
    const text = normalize(element.innerText || element.textContent);
    if (text.includes("★")) return String(countActiveStars(element));
    if (text.includes("―") || text === "-") return "0";
    const number = text.match(/-?\d+(?:\.\d+)?/);
    return number ? number[0] : "";
  }

  function getCells(sectionNodes) {
    const cells = [];
    sectionNodes.forEach((sectionNode) => {
      sectionNode.querySelectorAll("tr").forEach((row) => {
        const rowCells = [...row.querySelectorAll("th,td")];
        rowCells.forEach((cell, index) => cells.push({ cell, row, rowCells, index, text: normalize(cell.innerText) }));
      });
    });
    return cells;
  }

  function findStatusValue(label, cells, sectionText) {
    const labelPattern = new RegExp(`${escapeRegex(label)}\\s*([★―-]+|\\d+(?:\\.\\d+)?)`);
    for (const item of cells) {
      if (!cellMatchesLabel(label, item.text)) continue;
      const nextCell = item.rowCells[item.index + 1];
      if (nextCell) {
        const nextText = normalize(nextCell.innerText);
        if (/^[★―\-\d\s.]+$/.test(nextText)) return { value: readValueElement(nextCell), source: normalize(item.row.innerText) };
      }
      if (item.text.match(labelPattern) || item.text.includes("★") || item.text.includes("―")) {
        return { value: readValueElement(item.cell), source: normalize(item.row.innerText || item.text) };
      }
    }
    const textMatch = sectionText.match(labelPattern);
    return textMatch ? { value: textMatch[1].includes("★") ? String(textMatch[1].length) : textMatch[1].replace(/[―-]/, "0"), source: textMatch[0] } : null;
  }

  function extractStatusRows() {
    const sectionNodes = collectSectionNodes("各種能力");
    const cells = getCells(sectionNodes);
    const sectionText = normalize(sectionNodes.map((node) => node.innerText).join("\n"));
    return STATUS_LABELS.map((label) => {
      const result = findStatusValue(label, cells, sectionText);
      return [pageName, "各種能力", label, "", result?.value || "", result?.source || ""];
    });
  }

  function extractRankRows() {
    const nodes = collectSectionNodes("装備ランク全体効果");
    const lines = nodes.flatMap((node) => normalize(node.innerText).split(/\n+/).map(normalize).filter(Boolean));
    const rows = [];
    const statRegex = new RegExp(`(${RANK_STAT_LABELS.join("|")})\\s*\\+\\s*(-?\\d+(?:\\.\\d+)?)`, "g");
    lines.forEach((line) => {
      const rank = line.match(/Rank\s*(\d+)/i)?.[1];
      if (!rank) return;
      for (const match of line.matchAll(statRegex)) {
        const statName = match[1] === "会心ダメージ" ? "会心DMG" : match[1];
        rows.push([pageName, "装備ランク全体効果", statName, rank, match[2], line]);
      }
    });
    return rows;
  }

  const escapeTsv = (value) => String(value ?? "").replace(/\r?\n/g, " ").replace(/\t/g, " ");
  const rows = [OUTPUT_HEADERS, ...extractStatusRows(), ...extractRankRows()];
  const tsv = rows.map((row) => row.map(escapeTsv).join("\t")).join("\n");

  function copy(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }

  copy(tsv).then(() => {
    console.log(tsv);
    alert(`TSVをコピーしました: ${pageName}\n${rows.length - 1} 行`);
  }).catch((error) => {
    console.log(tsv);
    alert(`コピーに失敗しました。コンソールからTSVを確認してください。\n${error?.message || error}`);
  });
})();

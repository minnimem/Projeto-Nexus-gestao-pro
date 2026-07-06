import { escapeHtml } from "./exporters";

const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

function normalizeCode128Value(value) {
  const clean = String(value || "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
  return clean || "SEM-CODIGO";
}

export function buildCode128Svg(value) {
  const text = normalizeCode128Value(value);
  const codes = [104, ...text.split("").map((char) => char.charCodeAt(0) - 32)];
  const checksum = codes.reduce((total, code, index) => total + code * (index === 0 ? 1 : index), 0) % 103;
  const sequence = [...codes, checksum, 106];
  const moduleWidth = 1.45;
  const height = 34;
  let x = 0;
  const bars = [];

  sequence.forEach((code) => {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) return;

    pattern.split("").forEach((widthChar, index) => {
      const width = Number(widthChar) * moduleWidth;
      if (index % 2 === 0) {
        bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${width.toFixed(2)}" height="${height}" />`);
      }
      x += width;
    });
  });

  return `
    <svg class="label-barcode" viewBox="0 0 ${x.toFixed(2)} ${height}" preserveAspectRatio="none" aria-label="Código de barras ${escapeHtml(text)}">
      ${bars.join("")}
    </svg> ?
  `;
}

function qrGfMultiply(x, y) {
  let result = 0;
  let a = x;
  let b = y;

  while (b > 0) {
    if (b & 1) result ^= a;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d;
    b >>= 1;
  }

  return result;
}

function qrReedSolomonDivisor(degree) {
  const result = Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = qrGfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = qrGfMultiply(root, 2);
  }

  return result;
}

function qrReedSolomonRemainder(data, degree) {
  const divisor = qrReedSolomonDivisor(degree);
  const result = Array(degree).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let i = 0; i < degree; i += 1) {
      result[i] ^= qrGfMultiply(divisor[i], factor);
    }
  });

  return result;
}

function appendQrBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
}

export function buildQrCodeSvg(value) {
  const text = normalizeCode128Value(value).slice(0, 78);
  const bytes = Array.from(new TextEncoder().encode(text)).slice(0, 78);
  const version = 4;
  const size = version * 4 + 17;
  const dataCodewords = 80;
  const eccCodewords = 20;
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  function setFunction(row, col, dark) {
    if (row < 0 || col < 0 || row >= size || col >= size) return;
    modules[row][col] = dark;
    reserved[row][col] = true;
  }

  function drawFinder(centerRow, centerCol) {
    for (let dr = -4; dr <= 4; dr += 1) {
      for (let dc = -4; dc <= 4; dc += 1) {
        const row = centerRow + dr;
        const col = centerCol + dc;
        const dist = Math.max(Math.abs(dr), Math.abs(dc));
        setFunction(row, col, dist !== 2 && dist !== 4);
      }
    }
  }

  function drawAlignment(centerRow, centerCol) {
    for (let dr = -2; dr <= 2; dr += 1) {
      for (let dc = -2; dc <= 2; dc += 1) {
        setFunction(centerRow + dr, centerCol + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
      }
    }
  }

  function drawFormatBits(mask) {
    const data = (1 << 3) | mask;
    let remainder = data << 10;
    for (let i = 14; i >= 10; i -= 1) {
      if (((remainder >>> i) & 1) !== 0) remainder ^= 0x537 << (i - 10);
    }
    const bits = ((data << 10) | remainder) ^ 0x5412;

    for (let i = 0; i <= 5; i += 1) setFunction(8, i, ((bits >>> i) & 1) !== 0);
    setFunction(8, 7, ((bits >>> 6) & 1) !== 0);
    setFunction(8, 8, ((bits >>> 7) & 1) !== 0);
    setFunction(7, 8, ((bits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, ((bits >>> i) & 1) !== 0);
    for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
    for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, ((bits >>> i) & 1) !== 0);
    setFunction(8, size - 8, true);
  }

  drawFinder(3, 3);
  drawFinder(3, size - 4);
  drawFinder(size - 4, 3);
  drawAlignment(26, 26);
  for (let i = 8; i < size - 8; i += 1) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }
  drawFormatBits(0);

  const bits = [];
  appendQrBits(bits, 0x4, 4);
  appendQrBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendQrBits(bits, byte, 8));
  appendQrBits(bits, 0, Math.min(4, dataCodewords * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
  }
  for (let pad = 0xec; data.length < dataCodewords; pad ^= 0xec ^ 0x11) {
    data.push(pad);
  }

  const allCodewords = [...data, ...qrReedSolomonRemainder(data, eccCodewords)];
  const stream = allCodewords.flatMap((byte) => Array.from({ length: 8 }, (_, index) => (byte >>> (7 - index)) & 1));
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vert = 0; vert < size; vert += 1) {
      const row = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        if (!reserved[row][col]) {
          const mask = (row + col) % 2 === 0;
          modules[row][col] = Boolean((stream[bitIndex] || 0) ^ mask);
          bitIndex += 1;
        }
      }
    }
    upward = !upward;
  }

  const quiet = 4;
  const rects = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (modules[row][col]) rects.push(`<rect x="${col + quiet}" y="${row + quiet}" width="1" height="1" />`);
    }
  }

  return `
    <svg class="label-qr" viewBox="0 0 ${size + quiet * 2} ${size + quiet * 2}" preserveAspectRatio="none" aria-label="QR Code ${escapeHtml(text)}">
      <rect x="0" y="0" width="${size + quiet * 2}" height="${size + quiet * 2}" fill="#fff" />
      <g fill="#111827">${rects.join("")}</g>
    </svg> ?
  `;
}

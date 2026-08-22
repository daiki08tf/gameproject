/* ============================================================
   ふっかつのじゅもん
   セーブデータ(JSON) → gzip圧縮 → base64 → カタカナ64文字表に変換
   チェック文字1つを末尾に付与し、入力ミスを検出できるようにする。
   ============================================================ */

// base64の64文字(A-Z,a-z,0-9,+,/)に対応するカタカナ64種
const KATAKANA = [
  'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
  'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
  'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ',
  'マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ',
  'ル','レ','ロ','ワ','ン','ヲ',
  'ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ',
  'ダ','ヂ','ヅ','デ','ド','バ','ビ','ブ',
];
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const B64_TO_KANA = {};
const KANA_TO_B64 = {};
for (let i = 0; i < 64; i++) {
  B64_TO_KANA[B64_CHARS[i]] = KATAKANA[i];
  KANA_TO_B64[KATAKANA[i]] = B64_CHARS[i];
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gzipCompress(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gzipDecompress(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function checksumChar(b64) {
  let sum = 0;
  for (let i = 0; i < b64.length; i++) sum = (sum + b64.charCodeAt(i) * (i + 1)) % 64;
  return KATAKANA[sum];
}

// セーブデータ(オブジェクト) → じゅもん文字列
export async function encodeSpell(saveData) {
  const json = JSON.stringify(saveData);
  const rawBytes = new TextEncoder().encode(json);
  const compressed = await gzipCompress(rawBytes);
  const marker = compressed ? 1 : 0;
  const payload = compressed || rawBytes;
  const bytes = new Uint8Array(payload.length + 1);
  bytes[0] = marker;
  bytes.set(payload, 1);

  const b64 = bytesToBase64(bytes).replace(/=+$/, '');
  const kana = b64.split('').map((c) => B64_TO_KANA[c]).join('');
  const full = kana + checksumChar(b64);

  // 読みやすいように4文字ずつ区切る
  const chunks = [];
  for (let i = 0; i < full.length; i += 4) chunks.push(full.slice(i, i + 4));
  return chunks.join('・');
}

// じゅもん文字列 → セーブデータ(オブジェクト)。失敗時は { error: '...' } を返す
export async function decodeSpell(spellText) {
  const cleaned = spellText.replace(/[・\s]/g, '');
  if (cleaned.length < 2) return { error: 'じゅもんが短すぎます' };

  const dataKana = cleaned.slice(0, -1);
  const checkKana = cleaned.slice(-1);

  let b64 = '';
  for (const ch of dataKana) {
    const b = KANA_TO_B64[ch];
    if (!b) return { error: `「${ch}」は呪文に使われない文字です` };
    b64 += b;
  }

  if (checksumChar(b64) !== checkKana) {
    return { error: 'じゅもんが正しくありません（入力ミスがあるかもしれません）' };
  }

  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  let bytes;
  try {
    bytes = base64ToBytes(b64 + pad);
  } catch (e) {
    return { error: 'じゅもんの解読に失敗しました' };
  }

  const marker = bytes[0];
  const payload = bytes.subarray(1);
  let finalBytes;
  try {
    finalBytes = marker === 1 ? await gzipDecompress(payload) : payload;
  } catch (e) {
    return { error: 'じゅもんの展開に失敗しました（対応していないブラウザの可能性があります）' };
  }

  try {
    const json = new TextDecoder().decode(finalBytes);
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || !('equipped' in data) || !('jobs' in data)) {
      return { error: 'セーブデータの形式が正しくありません' };
    }
    return { data };
  } catch (e) {
    return { error: 'セーブデータの読み取りに失敗しました' };
  }
}

# Phase 10.6 — Lv10,000+ Numeric Safety / Digit Resilience

## Goal

Lv10,000〜99,999の長期進行で、戦闘・報酬・UI表示が桁増加によって壊れないことを正式に検証する。

対象は単なる見た目ではなく以下を含む。

- Character EXP / cumulative EXP
- Abyss推奨Lv / Item Power / combat scale / stage EXP
- Endgame reward profile
- HP / MP bar ratio
- NaN / Infinity / unsafe integer
- 大きな数値の表示可読性

## Audit result

現行のLv99,999ロードマップ範囲では、Character EXP・Abyssスケール・Endgame Rewardの主要計算はJavaScript `Number`の有限値かつsafe integer圏内に収まる。

そのためBigIntへの移行や戦闘式の全面変更は不要。

Abyss 3,000F以降もCharacter Lv / Item Powerは上限固定で、自己ベスト用のpost-cap倍率は対数成長のため急激なオーバーフローを起こさない。

## Safety layer

`js/data/numericSafety.js` を追加。

- `finiteGameNumber` — NaN / Infinityをfallbackへ正規化
- `safeGameInteger` — safe integer範囲へ丸める
- `safeRatio` — 0除算・非有限比率を防止
- `percentWidth` — UIバーを0〜100%へ固定
- `formatGameNumber` — 日本語ロケールの桁区切り / compact表示
- `numericSafetySnapshot` — 数値監査用の状態スナップショット

この層は今後の高桁UIで共通利用するcanonical helperとする。

## Regression contracts

`tests/phase10-6-numeric-safety.test.js` で以下を固定する。

1. Character Lv99,999までの単Lv EXP / cumulative EXPがfinite + safe integer
2. Abyss 1F〜3,000F、およびpost-cap深度でもcombat scaleがfinite
3. Abyss stage EXPがsafe integer
4. Endgame reward profileが主要チェックポイントでfinite
5. NaN / Infinity / 0除算がnumeric safety helperから漏れない
6. HP / MPバーが比率ベースであり固定桁数に依存しない

## Decision

Phase 10.6ではゲームバランス値そのものは変更しない。

理由は、現行ロードマップの最大値が安全圏内であり、不要な数値圧縮やBigInt化はセーブ互換性・既存計算との整合性を悪化させるため。

今後Lv99,999超の恒久レベルや指数的なGold/HP成長を導入する場合は、この監査契約を再実行してから数値型を変更する。

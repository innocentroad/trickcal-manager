# 編成共有保守工程とdatasheet skillの接続メモ

このリポジトリでは、共有URLの永続番号・表示データ・内容ハッシュを、生成済みデータと同じ更新工程で検査する。正しい手順は次のとおり。

1. `tools/trickcal_datasheet.xlsx` を更新する。TSV作成だけでは共有辞書を変更しない。
2. `tools\generate-all.bat` を実行する。`apostles.js`、`cards.js`、`statData.js` の生成後に、共有辞書末尾追記、共有表示データ生成、内容ハッシュ同期、公開前検査まで実行する。
3. 個別工程を使った場合は、最後に `node tools\validate-formation-share-maintenance.js` を実行する。資材版だけを更新する場合は `node tools\sync-formation-share-assets.js --write` の後に検査する。
4. 既存IDの並べ替え・削除・再利用、IDの推測改名は行わない。不足や消失は検査結果を確認して元データまたは廃止方針を整理する。

通常の生成skillはこのManager内の `AGENTS.md`、`README.md`、`docs/formation-share-maintenance-design.md` を参照し、共有辞書・表示データ・資材版の個数や版文字列をskill側へ複製しない。TSV skillは「貼り付け用TSVを作る工程」に留め、Excel反映後の生成・共有検査へ引き継ぐ。

環境提供のskill本体はリポジトリ外の管理対象であるため、この作業では本体を直接編集せず、上記の適用先と標準コマンドをリポジトリ内へ記録した。skill本体を更新する場合は、同じ内容を生成skillの実行後手順とTSV skillの引き継ぎ注意へ反映する。

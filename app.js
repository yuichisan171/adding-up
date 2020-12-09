'use strict';
const fs = require('fs'); // FileSystemの略で、ファイルを扱うためのモジュール
const readline = require('readline'); // ファイルを1行ずつ読み込むためのモジュール
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
rl.on('line', lineString => { //rlオブジェクトでlineというイベントが発生したら、コンソールに引数lineStringの内容を出力してくださいというもの
  const columns = lineString.split(','); //カンマ,で分割して、それをcolumnsという名前の配列にしている。例えば"ab,cde,f"なら、["ab", "cde", "f"]と分割される。
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]); //配列columnsの要素へ並び順の番号でアクセス。0:集計年,1:都道府県,2:15~19歳の人口と、それぞれ変数に保存
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture); //連想配列prefectureDataMapからデータを取得
    if (!value) { // valueの値がFalsyの場合、valueに初期値となるオブジェクトを代入。
      value = {
        popu10: 0, // 2010年の人口
        popu15: 0, // 2015年の人口 
        change: null // 人口の変化率
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
rl.on('close', () => { //closeイベントは、全ての行が読み込み終わったときに呼び出される。
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10; //集計データのオブジェクトvalueのchangeプロパティに変化率を代入する
  }
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => { //sortに対して渡す関数は比較関数といい、これによって並び替えをする
    return pair2[1].change - pair1[1].change;
  });
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      ': ' +
      value.popu10 +
      '=>' +
      value.popu15 +
      ' 変化率:' +
      value.change
    );
  });
  console.log(rankingStrings);
});
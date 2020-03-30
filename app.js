'use strict';
// Node.js に用意されたモジュールを呼び出しています。
// これは以前の練習でも出てきたのですが、 Node.js におけるモジュールとなるオブジェクトの呼び出し方です。
// モジュールには色々な機能が用意されているので、それを使えば、自分で一から処理を書かなくても済むのです。
// 今回使うモジュール fs は、FileSystem（ファイルシステム）の略で、ファイルを扱うためのモジュールです。
// readline は、ファイルを一行ずつ読み込むためのモジュールです。
const fs = require('fs');
const readline = require('readline');

//popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成し、 さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成しています。
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

// 先ほど確認した CSV ファイルの内容が、そのまま出力されます。
// 「ファイルを一行ずつ読み込む」という部分は実装できました。
// rl.on('line', (lineString) => {
//   console.log(lineString);
// });

const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
// 集計されたデータを格納する連想配列です。
// 添字となるキー (key) と値 (value) が何であるのかは、コードだけからは読み取りにくいため、コメントに書いておきます。
// 2010 年と 2015 年のデータから 「集計年」「都道府県」「15〜19歳の人口」を抜き出す、という処理の実装をしていきます。
// これで、 2010 年と 2015 年の際の集計年、都道府県、15〜19歳の人口がコンソール上に出力されます。

rl.on('line', (lineString) => {
  const columns = lineString.split(',');
  //   この行は、引数 lineString で与えられた文字列をカンマ , で分割して、それを columns という名前の配列にしています。
// たとえば、"ab,cde,f" という文字列であれば、["ab", "cde", "f"]という文字列からなる配列に分割されます。
// 今回扱うファイルは各行が 集計年,都道府県名,10〜14歳の人口,15〜19歳の人口 という形式になっているので、これをカンマ , で分割すると ["集計年","都道府県名","10〜14歳の人口","15〜19歳の人口"] といった配列になります。
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  // 上記では配列 columns の要素へ並び順の番号でアクセスして、集計年（0 番目）、都道府県（1 番目）、15〜19 歳の人口（3 番目）、をそれぞれ変数に保存しています。
// 人口の部分だけ parseInt() （パースイント）という関数が使われています。これは文字列を整数値に変換する関数です。
// そもそも lineString.split() は、文字列を対象とした関数なので、結果も文字列の配列になっています。 しかし、集計年や 15〜19 歳の人口はもともと数値なので、文字列のままだとのちのち数値と比較したときなどに不都合が生じます。 そこで、これらの変数を文字列から数値に変換するために、parseInt() を使っているのです。

  // if (year === 2010 || year === 2015) {
  //   console.log(year);
  //   console.log(prefecture);
  //   console.log(popu);
  // }
//   集計年の数値 year が、 2010 または 2015 である時を if 文で判定しています。
// 2010 年または 2015 年のデータのみが、コンソールに出力されることになります。



// ここで作成された rl というオブジェクトも Stream のインタフェースを持っています。
// 利用する際はこのようなコードになります。
// このコードは、rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください、という意味です。
// 無名関数の処理の中で console.log を使っているので、line イベントが発生したタイミングで、コンソールに引数 lineString の内容が出力されることになります。 この lineString には、読み込んだ 1 行の文字列が入っています。
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    // このコードは連想配列 prefectureDataMap からデータを取得しています。
// value の値が Falsy の場合に、value に初期値となるオブジェクトを代入します。
// その県のデータを処理するのが初めてであれば、value の値は undefined になるので、この条件を満たし、value に値が代入されます。

// オブジェクトのプロパティ popu10 が 2010 年の人口、 popu15 が 2015 年の人口、 change が人口の変化率を表すプロパティです。
// 変化率には、初期値では null を代入しておきます。
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});

// ここで、人口のデータを連想配列に保存しています。
// 連想配列へ格納したので、次から同じ県のデータが来れば

// let value = prefectureDataMap.get(prefecture);
// のところでは、保存したオブジェクトが取得されることになります。
// rl.on('close', () => {
//   console.log(prefectureDataMap);
// });



// 'close' イベントは、全ての行を読み込み終わった際に呼び出されます。
// その際の処理として、各県各年男女のデータが集計された Map のオブジェクトを出力しています。

// 次に、都道府県ごとの変化率を計算してみましょう。
// 変化率の計算は、その県のデータが揃 そろったあとでしか正しく行えないので、 以下のように close イベントの中へ実装してみましょう。

// rl.on('close', () => {
//   for (let [key, value] of prefectureDataMap) { 
//     value.change = value.popu15 / value.popu10;
// //     集計データのオブジェクト value の change プロパティに、変化率を代入するコードです。
// // これで変化率を無事計算することができました。
//   }
//   console.log(prefectureDataMap);
// });

// このように close イベントの無名関数を実装します。

// for (let [key, value] of prefectureDataMap) {
// これは初めて見る書き方だと思いますが、for-of 構文といいます。
// Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができます。
// 配列に含まれる要素を使いたいだけで、添字は不要な場合に便利です。

// また、 Map に for-of を使うと、キーと値で要素が 2 つある配列が前に与えられた変数に代入されます。ここでは分割代入という方法を使っています。 let [変数名1, 変数名2] のように変数と一緒に配列を宣言することで、第一要素の key という変数にキーを、第二要素の value という変数に値を代入することができます。

// 得られた結果を、変化率ごとに並べ替えてみましょう。

// rl.on('close', () => {
//   for (let [key, value] of prefectureDataMap) { 
//     value.change = value.popu15 / value.popu10;
//   }
//   const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
//     return pair2[1].change - pair1[1].change;
//   });
//   console.log(rankingArray);
// });
//   まず Array.from(prefectureDataMap) の部分で、連想配列を普通の配列に変換する処理をおこなっています。

// 更に、Array の sort 関数を呼んで無名関数を渡しています。
// sort に対して渡すこの関数は比較関数と言い、これによって並び替えをするルールを決めることができます。

// 比較関数は 2 つの引数を受けとって、
// 前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
// pair2 を pair1 より前にしたいときは、正の整数、
// pair1 と pair2 の並びをそのままにしたいときは、 0 を返す必要があります。
// ここでは変化率の降順に並び替えを行いたいので、 pair2 が pair1 より大きかった場合、pair2 を pair1 より前にする必要があります。

// つまり、pair2 が pair1 より大きいときに正の整数を返すような処理を書けば良いので、 ここではpair2 の変化率のプロパティから pair1 の変化率のプロパティを引き算した値を返しています。 これにより、変化率の降順に並び替えが行われます。
// より詳しく知りたい場合には、MDN の sort 関数の説明を読んでみましょう。

// 綺麗に整形して出力してみましょう。
rl.on('close', () => {
  for (let [key, value] of prefectureDataMap) { 
    value.change = value.popu15 / value.popu10;
  }
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  const rankingStrings = rankingArray.map(([key, value]) => {
    return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
  });
  console.log(rankingStrings);
});

// ここに出てくる map ですが、先ほどの連想配列の Map とは別のもので、 map 関数といいます。読み方は同じですが、「連想配列の Map」と「map 関数」は別物なので気をつけてください。

// つまりこの部分では、「Map の キーと値が要素になった配列を要素 [key, value] として受け取り、それを文字列に変換する」処理を行っています。
// これで、綺麗に整形されて出力されるはずです。

// このように「2010 年から 2015 年にかけて 15〜19 歳の人が増えた割合の都道府県ランキング」が無事出力されました。
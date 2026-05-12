/**
 * 明朝皇族种子数据脚本 v2
 * 运行: npx tsx scripts/seed-ming-dynasty.ts
 */

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "family.db");

function remarkJSON(text: string): string {
  return JSON.stringify([{ type: "paragraph", children: [{ text }] }]);
}

interface RawPerson {
  name: string;
  generation: number;
  sibling_order: number;
  father_id: number | null;
  gender: "男" | "女";
  title: string | null;
  is_alive: 0 | 1;
  spouse: string | null;
  remarks: string;
  birthday: string;
  death_date: string | null;
  residence: string | null;
}

function seed(db: Database.Database) {
  db.exec("DELETE FROM family_members");
  db.exec("DELETE FROM sqlite_sequence WHERE name='family_members'");

  const insert = db.prepare(
    `INSERT INTO family_members (name, generation, sibling_order, father_id, gender, official_position, is_alive, spouse, remarks, birthday, death_date, residence_place)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const ids: Record<string, number> = {};

  function add(p: RawPerson): number {
    const id = Number(
      insert.run(
        p.name,
        p.generation,
        p.sibling_order,
        p.father_id,
        p.gender,
        p.title,
        p.is_alive,
        p.spouse,
        remarkJSON(p.remarks),
        p.birthday,
        p.death_date,
        p.residence
      ).lastInsertRowid
    );
    ids[p.name + "_" + p.title] = id;
    return id;
  }

  function getId(name: string, title: string | null = null): number {
    const key = title ? name + "_" + title : name + "_" + Object.keys(ids).find(k => k.startsWith(name + "_"))!;
    const id = ids[key] || Object.values(ids).find(() => false);
    // 按名字查找
    for (const [k, v] of Object.entries(ids)) {
      if (k.startsWith(name + "_")) return v;
    }
    throw new Error(`找不到: ${name}`);
  }

  // ============================================================
  // 第一代：朱元璋 及后妃
  // ============================================================
  const g1 = 1;
  const zhuYZ = add({
    name: "朱元璋", generation: g1, sibling_order: 1, father_id: null, gender: "男",
    title: "明太祖 · 洪武皇帝", is_alive: 0, spouse: "马皇后",
    remarks: "明太祖朱元璋（1328—1398），原名重八，字国瑞，濠州钟离人。少时贫苦，曾为僧乞食。参加郭子兴红巾军，逐渐壮大势力。1368年在应天称帝，国号大明，年号洪武。在位31年，北伐灭元，统一全国。废除丞相制，设锦衣卫，以重典治乱世。晚年诛杀功臣，株连甚广。庙号太祖，葬于南京明孝陵。",
    birthday: "1328-10-21", death_date: "1398-06-24", residence: "南京应天府",
  });

  // 朱元璋诸子（除朱标、朱棣外的重要藩王）
  add({
    name: "朱樉", generation: g1 + 1, sibling_order: 2, father_id: zhuYZ, gender: "男",
    title: "秦愍王", is_alive: 0, spouse: null,
    remarks: "朱樉（1356—1395），朱元璋次子。封秦王，就藩西安。多行不法，被太祖责罚。",
    birthday: "1356-12-03", death_date: "1395-04-09", residence: "西安府",
  });

  add({
    name: "朱棡", generation: g1 + 1, sibling_order: 3, father_id: zhuYZ, gender: "男",
    title: "晋恭王", is_alive: 0, spouse: null,
    remarks: "朱棡（1358—1398），朱元璋第三子。封晋王，就藩太原。智勇双全，深得太祖喜爱。",
    birthday: "1358-12-18", death_date: "1398-03-30", residence: "太原府",
  });

  // ============================================================
  // 第二代：朱标 → 建文帝朱允炆
  // ============================================================
  const zhuBiao = add({
    name: "朱标", generation: g1 + 1, sibling_order: 1, father_id: zhuYZ, gender: "男",
    title: "懿文太子（追尊兴宗）", is_alive: 0, spouse: "吕氏",
    remarks: "朱标（1355—1392），朱元璋长子。自幼被立为太子，仁慈宽厚，多次为获罪大臣求情。巡视陕西归来后病逝，年仅37岁。其早逝直接改变了明朝皇位继承格局，为靖难之役埋下伏笔。",
    birthday: "1355-10-10", death_date: "1392-05-17", residence: "南京应天府",
  });

  const zhuYW = add({
    name: "朱允炆", generation: g1 + 2, sibling_order: 1, father_id: zhuBiao, gender: "男",
    title: "建文皇帝", is_alive: 0, spouse: "马氏",
    remarks: "明惠帝朱允炆（1377—1402？），朱标次子。年号建文，在位4年。即位后重用齐泰、黄子澄推行削藩，引发燕王朱棣发动'靖难之役'。南京城破后下落不明，自焚、出家、流亡海外等说法众说纷纭。",
    birthday: "1377-12-05", death_date: null, residence: "南京应天府",
  });

  // ============================================================
  // 第三代：明成祖朱棣
  // ============================================================
  const zhuDi = add({
    name: "朱棣", generation: g1 + 1, sibling_order: 4, father_id: zhuYZ, gender: "男",
    title: "明成祖 · 永乐皇帝", is_alive: 0, spouse: "徐皇后",
    remarks: "明成祖朱棣（1360—1424），朱元璋第四子，封燕王。以'清君侧'为名发动靖难之役，夺取皇位，年号永乐。迁都北京，修建紫禁城；派郑和六下西洋；命解缙编纂《永乐大典》；五次亲征漠北。设东厂加强特务统治。驾崩于北征归途榆木川。",
    birthday: "1360-05-02", death_date: "1424-08-12", residence: "北京顺天府",
  });

  add({
    name: "朱高煦", generation: g1 + 2, sibling_order: 3, father_id: zhuDi, gender: "男",
    title: "汉王", is_alive: 0, spouse: null,
    remarks: "朱高煦（1380—1426），朱棣次子。骁勇善战，靖难之役屡救成祖。封汉王后觊觎皇位，宣德元年（1426）起兵谋反，被宣宗朱瞻基亲征平定后，囚于铜缸中以炭火烤死。",
    birthday: "1380-12-30", death_date: "1426-01-01", residence: "乐安州",
  });

  add({
    name: "朱高燧", generation: g1 + 2, sibling_order: 4, father_id: zhuDi, gender: "男",
    title: "赵简王", is_alive: 0, spouse: null,
    remarks: "朱高燧（1383—1431），朱棣第三子。曾参与汉王谋逆，因太子朱高炽庇护免死。就藩彰德府。",
    birthday: "1383-01-19", death_date: "1431-10-05", residence: "彰德府",
  });

  // ============================================================
  // 第四代：明仁宗朱高炽
  // ============================================================
  const zhuGC = add({
    name: "朱高炽", generation: g1 + 2, sibling_order: 1, father_id: zhuDi, gender: "男",
    title: "明仁宗 · 洪熙皇帝", is_alive: 0, spouse: "张皇后",
    remarks: "明仁宗朱高炽（1378—1425），朱棣长子。身体肥胖不善骑射，但仁厚好学。永乐年间多次监国理政。即位后年号洪熙，赦免建文旧臣，减税赋，停郑和下西洋。在位仅十个月病逝，却与子宣宗共同奠定了'仁宣之治'的基础。",
    birthday: "1378-08-16", death_date: "1425-05-29", residence: "北京顺天府",
  });

  // ============================================================
  // 第五代：明宣宗朱瞻基
  // ============================================================
  const zhuZJ = add({
    name: "朱瞻基", generation: g1 + 3, sibling_order: 1, father_id: zhuGC, gender: "男",
    title: "明宣宗 · 宣德皇帝", is_alive: 0, spouse: "胡皇后/孙皇后",
    remarks: "明宣宗朱瞻基（1399—1435），朱高炽长子。自幼得祖父朱棣宠爱，被立为皇太孙。年号宣德，在位10年。平定汉王朱高煦叛乱；派出郑和第七次下西洋；工书画，尤擅花鸟，爱斗蟋蟀，人称'促织天子'。开创'仁宣之治'，为明朝黄金时代。",
    birthday: "1399-03-16", death_date: "1435-01-31", residence: "北京顺天府",
  });

  // ============================================================
  // 第六代：明英宗朱祁镇
  // ============================================================
  const zhuQZ1 = add({
    name: "朱祁镇", generation: g1 + 4, sibling_order: 1, father_id: zhuZJ, gender: "男",
    title: "明英宗 · 正统/天顺皇帝", is_alive: 0, spouse: "钱皇后",
    remarks: "明英宗朱祁镇（1427—1464），朱瞻基长子。9岁即位，年号正统。1449年受太监王振蛊惑御驾亲征瓦剌，兵败土木堡被俘（土木之变）。其弟朱祁钰即位后尊其为太上皇。一年后被释返回，被软禁南宫七年。1457年石亨等发动'夺门之变'助其复辟，改元天顺。废除后妃殉葬制度，是其唯一的仁政。",
    birthday: "1427-11-29", death_date: "1464-02-23", residence: "北京顺天府",
  });

  // ============================================================
  // 第七代：明代宗朱祁钰
  // ============================================================
  add({
    name: "朱祁钰", generation: g1 + 4, sibling_order: 2, father_id: zhuZJ, gender: "男",
    title: "明代宗 · 景泰皇帝", is_alive: 0, spouse: "汪皇后/杭皇后",
    remarks: "明代宗朱祁钰（1428—1457），朱瞻基次子。土木之变后临危即位，年号景泰。任用于谦组织北京保卫战，击退瓦剌。执政八年，国家趋于稳定。后在其兄复辟的夺门之变中被废为郕王，不久去世。",
    birthday: "1428-09-21", death_date: "1457-03-14", residence: "北京顺天府",
  });

  // ============================================================
  // 第八代：明宪宗朱见深
  // ============================================================
  const zhuJS = add({
    name: "朱见深", generation: g1 + 5, sibling_order: 1, father_id: zhuQZ1, gender: "男",
    title: "明宪宗 · 成化皇帝", is_alive: 0, spouse: "万贵妃",
    remarks: "明宪宗朱见深（1447—1487），朱祁镇长子。年号成化，在位23年。童年历经废立风波，由宫女万贞儿抚养。即位后宠爱年长17岁的万贵妃，对其言听计从。设西厂强化特务统治。成化年间多弊政，但也有设郧阳府安置流民等善举。",
    birthday: "1447-12-09", death_date: "1487-09-09", residence: "北京顺天府",
  });

  // ============================================================
  // 第九代：明孝宗朱祐樘
  // ============================================================
  const zhuYC = add({
    name: "朱祐樘", generation: g1 + 6, sibling_order: 1, father_id: zhuJS, gender: "男",
    title: "明孝宗 · 弘治皇帝", is_alive: 0, spouse: "张皇后",
    remarks: "明孝宗朱祐樘（1470—1505），朱见深第三子。6岁前被秘密养于安乐堂中躲避万贵妃毒手。年号弘治，在位18年。勤政爱民，广开言路，任用王恕、刘大夏等贤臣，史称'弘治中兴'。一生只有张皇后一位妻子，是中国历史上唯一严格实行一夫一妻的皇帝。",
    birthday: "1470-07-30", death_date: "1505-06-08", residence: "北京顺天府",
  });

  // ============================================================
  // 第十代：明武宗朱厚照
  // ============================================================
  add({
    name: "朱厚照", generation: g1 + 7, sibling_order: 1, father_id: zhuYC, gender: "男",
    title: "明武宗 · 正德皇帝", is_alive: 0, spouse: "夏皇后",
    remarks: "明武宗朱厚照（1491—1521），朱祐樘独子。年号正德，在位16年。最不拘礼法的皇帝：不住乾清宫而建豹房；自封'总督军务威武大将军总兵官朱寿'；喜欢微服私访；在应州与蒙古小王子激战（应州大捷）。1521年落水得病而亡，无子嗣。",
    birthday: "1491-10-27", death_date: "1521-04-20", residence: "北京顺天府",
  });

  // ============================================================
  // 第十一代：兴王朱祐杬 → 明世宗朱厚熜
  // ============================================================
  const zhuYY = add({
    name: "朱祐杬", generation: g1 + 6, sibling_order: 4, father_id: zhuJS, gender: "男",
    title: "兴献王（追尊明睿宗）", is_alive: 0, spouse: "蒋氏",
    remarks: "朱祐杬（1476—1519），朱见深第四子。封兴王，就藩安陆。其子朱厚熜入继大统后，引发'大礼议'之争，被追尊为皇帝。",
    birthday: "1476-07-22", death_date: "1519-07-13", residence: "安陆（今湖北钟祥）",
  });

  const zhuHC = add({
    name: "朱厚熜", generation: g1 + 7, sibling_order: 2, father_id: zhuYY, gender: "男",
    title: "明世宗 · 嘉靖皇帝", is_alive: 0, spouse: null,
    remarks: "明世宗朱厚熜（1507—1567），兴王朱祐杬之子。正德帝无嗣，以堂弟身份入继大统。年号嘉靖，在位45年。早期励精图治、整顿朝纲；中后期迷信道教，追求长生不老，以'青词'取悦上天，二十多年不上朝。严嵩专权二十年。1542年发生'壬寅宫变'——十几名宫女趁其熟睡企图用黄绫勒死他，被后世视为千古奇案。著名清官海瑞上《治安疏》直斥'嘉靖者，言家家皆净而无财用也'。",
    birthday: "1507-09-16", death_date: "1567-01-23", residence: "北京顺天府",
  });

  // ============================================================
  // 第十二代：明穆宗朱载坖
  // ============================================================
  const zhuZaiJ = add({
    name: "朱载坖", generation: g1 + 8, sibling_order: 1, father_id: zhuHC, gender: "男",
    title: "明穆宗 · 隆庆皇帝", is_alive: 0, spouse: "李贵妃/陈皇后",
    remarks: "明穆宗朱载坖（1537—1572），朱厚熜第三子。年号隆庆，在位6年。即位后任用高拱、张居正等名臣，推行新政。最大的历史功绩：宣布解除海禁（隆庆开关），允许民间海外贸易；达成'俺答封贡'，与蒙古和平互市，结束了两百年战争。但沉迷女色，在位仅六年即病逝。",
    birthday: "1537-03-04", death_date: "1572-07-05", residence: "北京顺天府",
  });

  // ============================================================
  // 第十三代：明神宗朱翊钧
  // ============================================================
  const zhuYJ = add({
    name: "朱翊钧", generation: g1 + 9, sibling_order: 1, father_id: zhuZaiJ, gender: "男",
    title: "明神宗 · 万历皇帝", is_alive: 0, spouse: "王皇后/郑贵妃",
    remarks: "明神宗朱翊钧（1563—1620），朱载坖第三子。年号万历，在位48年，明朝在位最长的皇帝。前十年由张居正辅政，推行'一条鞭法'，开创'万历中兴'。亲政后因'国本之争'与文官集团激烈对抗，从此数十年不上朝。后期派出矿税监大肆敛财，辽东后金努尔哈赤崛起。万历三大征（朝鲜、播州、宁夏）消耗国力巨大。",
    birthday: "1563-09-04", death_date: "1620-08-18", residence: "北京顺天府",
  });

  // ============================================================
  // 第十四代：明光宗朱常洛
  // ============================================================
  const zhuCL = add({
    name: "朱常洛", generation: g1 + 10, sibling_order: 1, father_id: zhuYJ, gender: "男",
    title: "明光宗 · 泰昌皇帝", is_alive: 0, spouse: "郭皇后/李选侍",
    remarks: "明光宗朱常洛（1582—1620），朱翊钧长子。因其母为宫女，不为万历帝所喜，做了近二十年太子，历经'国本之争'、'梃击案'等数次危机。终于即位后，年号泰昌。励精图治：罢矿税、发内帑银犒赏边军、起用建言获罪诸臣。但即位仅29天即因服用'红丸'而暴毙，史称'一月天子'，成为'红丸案'主角。",
    birthday: "1582-08-28", death_date: "1620-09-26", residence: "北京顺天府",
  });

  // ============================================================
  // 第十五代：明熹宗朱由校
  // ============================================================
  add({
    name: "朱由校", generation: g1 + 11, sibling_order: 1, father_id: zhuCL, gender: "男",
    title: "明熹宗 · 天启皇帝", is_alive: 0, spouse: "张皇后",
    remarks: "明熹宗朱由校（1605—1627），朱常洛长子。年号天启，在位7年。天性聪慧，木工手艺极精，能自制家具和自动机械。但无意朝政，大权落于太监魏忠贤和乳母客氏之手，形成明代最黑暗的阉党专权。残酷镇压东林党人，左光斗、杨涟等忠良被害。在位期间，努尔哈赤攻占辽沈，明朝东北防线全面崩溃。",
    birthday: "1605-12-23", death_date: "1627-09-30", residence: "北京顺天府",
  });

  // ============================================================
  // 第十六代：明思宗朱由检（崇祯帝）
  // ============================================================
  add({
    name: "朱由检", generation: g1 + 11, sibling_order: 5, father_id: zhuCL, gender: "男",
    title: "明思宗 · 崇祯皇帝", is_alive: 0, spouse: "周皇后",
    remarks: "明思宗朱由检（1611—1644），朱常洛第五子，年号崇祯。在位17年，铲除魏忠贤阉党，勤于政事，节俭自律。但性格刚愎多疑，17年间更换内阁首辅19人、诛杀督师总督7人（含袁崇焕）。1644年李自成攻入北京，三月十九日拂晓，崇祯帝在煤山（今北京景山）自缢殉国。遗书曰：'朕自登基十七年，逆贼直逼京师。朕死，无面目见祖宗于地下，自去冠冕，以发覆面。任贼分裂朕尸，勿伤百姓一人。'",
    birthday: "1611-02-06", death_date: "1644-04-25", residence: "北京顺天府",
  });

  // ============================================================
  // 重要宗室
  // ============================================================
  add({
    name: "朱常洵", generation: g1 + 10, sibling_order: 3, father_id: zhuYJ, gender: "男",
    title: "福忠王", is_alive: 0, spouse: null,
    remarks: "朱常洵（1586—1641），万历帝第三子，郑贵妃所生。'国本之争'核心人物，万历帝屡欲立其为太子而被群臣反对。封福王后富甲天下。1641年李自成攻破洛阳，被处死。传言与鹿肉共煮，称'福禄宴'。",
    birthday: "1586-02-22", death_date: "1641-03-02", residence: "洛阳",
  });

  // ============================================================
  // 南明弘光帝 朱由崧
  // ============================================================
  add({
    name: "朱由崧", generation: g1 + 11, sibling_order: 8, father_id: getId("朱常洵"), gender: "男",
    title: "南明 · 弘光皇帝（明安宗）", is_alive: 0, spouse: null,
    remarks: "明安宗朱由崧（1607—1646），福王朱常洵长子。崇祯帝自缢后，被史可法、马士英等在南京拥立为帝，年号弘光。昏庸无能，朝中党争激烈。在位仅八个月，清军南下，南京城破，被俘押往北京，翌年被处死。",
    birthday: "1607-09-05", death_date: "1646-07-01", residence: "南京应天府",
  });

  // ============================================================
  // 南明隆武帝 朱聿键
  // ============================================================
  add({
    name: "朱聿键", generation: g1 + 11, sibling_order: 9, father_id: null, gender: "男",
    title: "南明 · 隆武皇帝（明绍宗）", is_alive: 0, spouse: "曾皇后",
    remarks: "明绍宗朱聿键（1602—1646），朱元璋九世孙，唐王系。弘光政权覆灭后在福州被郑芝龙等拥立为帝，年号隆武。有志恢复，但受制于郑芝龙。1646年清军入闽，被俘后绝食而死。",
    birthday: "1602-05-25", death_date: "1646-10-06", residence: "福州府",
  });

  // ============================================================
  // 南明永历帝 朱由榔（最后一位南明皇帝）
  // ============================================================
  add({
    name: "朱由榔", generation: g1 + 11, sibling_order: 10, father_id: null, gender: "男",
    title: "南明 · 永历皇帝（明昭宗）", is_alive: 0, spouse: "王皇后",
    remarks: "明昭宗朱由榔（1623—1662），万历帝之孙。1646年隆武政权覆灭后在肇庆被拥立，年号永历。辗转于广东、广西、云南、缅甸之间，与张献忠余部李定国合作抗清。1662年被吴三桂俘虏，用弓弦勒死于昆明篦子坡。永历之死标志着明朝彻底灭亡。",
    birthday: "1623-11-01", death_date: "1662-06-01", residence: "肇庆府→缅甸→昆明",
  });

  // ============================================================
  // 重要名臣标记（郑和、于谦、张居正等标记在相关皇帝备注中）
  // ============================================================

  const total = db.prepare("SELECT COUNT(*) as count FROM family_members").get() as { count: number };
  console.log(`✅ 种子数据写入完成，共 ${total.count} 人`);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
seed(db);
db.close();

/**
 * 明朝皇族 demo 数据库构建脚本
 * 运行: npx tsx scripts/build-ming-demo.ts
 * 输出: data/ming-demo.db
 *
 * 数据来源：
 *   - scripts/seed-ming-dynasty.ts（皇帝世系 + 重要宗室）
 *   - scripts/insert-ming-data.sql（26子 + 各藩王后代扩展）
 */

import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "ming-demo.db");

function remarkJSON(text: string): string {
  return JSON.stringify([{ type: "paragraph", children: [{ text }] }]);
}

// ============================================================
// sql.js 简易封装
// ============================================================
class SqlJsWrapper {
  constructor(private database: SqlJsDatabase) {}

  prepare(sql: string) {
    const stmt = this.database.prepare(sql);
    const self = this;
    return {
      all(...params: unknown[]) {
        if (params.length) stmt.bind(params as import("sql.js").SqlValue[]);
        const results: unknown[] = [];
        while (stmt.step()) results.push(stmt.getAsObject());
        stmt.free();
        return results;
      },
      get(...params: unknown[]) {
        if (params.length) stmt.bind(params as import("sql.js").SqlValue[]);
        let result: unknown = undefined;
        if (stmt.step()) result = stmt.getAsObject();
        stmt.free();
        return result;
      },
      run(...params: unknown[]) {
        if (params.length) stmt.bind(params as import("sql.js").SqlValue[]);
        stmt.step();
        stmt.free();
        const lastRow = self
          .execSelect("SELECT last_insert_rowid() as id")[0] as Record<string, unknown> | undefined;
        const lastId = lastRow?.id as number | undefined;
        return { lastInsertRowid: lastId, changes: self.getRowsModified() };
      },
      free() { stmt.free(); },
    };
  }

  exec(sql: string) { this.database.run(sql); }
  private execSelect(sql: string): unknown[] {
    const results: unknown[] = [];
    const stmt = this.database.prepare(sql);
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  }
  getRowsModified(): number { return this.database.getRowsModified(); }
  close() { this.database.close(); }
}

// ============================================================
// 表结构（与 lib/db.ts 保持一致）
// ============================================================
function initTables(db: SqlJsWrapper) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generation INTEGER,
      sibling_order INTEGER,
      father_id INTEGER REFERENCES family_members(id),
      mother_id INTEGER REFERENCES family_members(id),
      mother_name TEXT,
      gender TEXT CHECK (gender IN ('男', '女')),
      official_position TEXT,
      is_alive INTEGER DEFAULT 1,
      is_root INTEGER DEFAULT 0,
      spouse TEXT,
      remarks TEXT,
      birthday TEXT,
      death_date TEXT,
      residence_place TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS spouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      spouse_member_id INTEGER REFERENCES family_members(id),
      name TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      end_reason TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_family_members_father_id ON family_members(father_id);
    CREATE INDEX IF NOT EXISTS idx_family_members_name ON family_members(name);
    CREATE INDEX IF NOT EXISTS idx_spouses_member_id ON spouses(member_id);
  `);
}

// ============================================================
// 插入辅助
// ============================================================
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

function seedMing(db: SqlJsWrapper) {
  const ids: Record<string, number> = {};

  function add(p: RawPerson): number {
    const insert = db.prepare(
      `INSERT INTO family_members (name, generation, sibling_order, father_id, gender, official_position, is_alive, spouse, remarks, birthday, death_date, residence_place)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = insert.run(
      p.name, p.generation, p.sibling_order, p.father_id, p.gender,
      p.title, p.is_alive, p.spouse, remarkJSON(p.remarks),
      p.birthday, p.death_date, p.residence
    );
    const id = result.lastInsertRowid!;
    ids[p.name + "_" + (p.title || p.generation)] = id;
    return id;
  }

  function getId(name: string): number {
    for (const [k, v] of Object.entries(ids)) {
      if (k.startsWith(name + "_")) return v;
    }
    throw new Error(`找不到: ${name}`);
  }

  // ============================================================
  // 第一代：朱元璋 及后妃
  // ============================================================
  const zhuYZ = add({
    name: "朱元璋", generation: 1, sibling_order: 1, father_id: null, gender: "男",
    title: "明太祖 · 洪武皇帝", is_alive: 0, spouse: "马皇后",
    remarks: "明太祖朱元璋（1328—1398），原名重八，字国瑞，濠州钟离人。少时贫苦，曾为僧乞食。参加郭子兴红巾军，逐渐壮大势力。1368年在应天称帝，国号大明，年号洪武。在位31年，北伐灭元，统一全国。废除丞相制，设锦衣卫，以重典治乱世。晚年诛杀功臣，株连甚广。庙号太祖，葬于南京明孝陵。",
    birthday: "1328-10-21", death_date: "1398-06-24", residence: "南京应天府",
  });

  // 子女数量（先录入已有人物，后由SQL批量补充儿子）
  const g1p1 = 1; // 朱元璋 generation

  // 已录入4个重要儿子，其余由SQL补充
  add({ name: "朱樉", generation: 2, sibling_order: 2, father_id: zhuYZ, gender: "男", title: "秦愍王", is_alive: 0, spouse: null, remarks: "朱樉（1356—1395），朱元璋次子。封秦王，就藩西安。多行不法，被太祖责罚。", birthday: "1356-12-03", death_date: "1395-04-09", residence: "西安府" });
  add({ name: "朱棡", generation: 2, sibling_order: 3, father_id: zhuYZ, gender: "男", title: "晋恭王", is_alive: 0, spouse: null, remarks: "朱棡（1358—1398），朱元璋第三子。封晋王，就藩太原。智勇双全，深得太祖喜爱。", birthday: "1358-12-18", death_date: "1398-03-30", residence: "太原府" });

  // 朱标 → 朱允炆
  const zhuBiao = add({ name: "朱标", generation: 2, sibling_order: 1, father_id: zhuYZ, gender: "男", title: "懿文太子（追尊兴宗）", is_alive: 0, spouse: "吕氏", remarks: "朱标（1355—1392），朱元璋长子。自幼被立为太子，仁慈宽厚。巡视陕西归来后病逝，年仅37岁。其早逝直接改变了明朝皇位继承格局，为靖难之役埋下伏笔。", birthday: "1355-10-10", death_date: "1392-05-17", residence: "南京应天府" });

  const zhuYW = add({ name: "朱允炆", generation: 3, sibling_order: 1, father_id: zhuBiao, gender: "男", title: "建文皇帝", is_alive: 0, spouse: "马氏", remarks: "明惠帝朱允炆（1377—1402？），朱标次子。年号建文，在位4年。即位后推行削藩，引发燕王朱棣发动靖难之役。南京城破后下落不明。", birthday: "1377-12-05", death_date: null, residence: "南京应天府" });

  // 朱棣
  const zhuDi = add({ name: "朱棣", generation: 2, sibling_order: 4, father_id: zhuYZ, gender: "男", title: "明成祖 · 永乐皇帝", is_alive: 0, spouse: "徐皇后", remarks: "明成祖朱棣（1360—1424），朱元璋第四子，封燕王。以清君侧为名发动靖难之役，夺取皇位，年号永乐。迁都北京，修建紫禁城；派郑和六下西洋；命解缙编纂《永乐大典》；五次亲征漠北。设东厂加强特务统治。驾崩于北征归途榆木川。", birthday: "1360-05-02", death_date: "1424-08-12", residence: "北京顺天府" });

  add({ name: "朱高煦", generation: 3, sibling_order: 3, father_id: zhuDi, gender: "男", title: "汉王", is_alive: 0, spouse: null, remarks: "朱高煦（1380—1426），朱棣次子。骁勇善战。封汉王后觊觎皇位，宣德元年起兵谋反，被宣宗亲征平定后处死。", birthday: "1380-12-30", death_date: "1426-01-01", residence: "乐安州" });
  add({ name: "朱高燧", generation: 3, sibling_order: 4, father_id: zhuDi, gender: "男", title: "赵简王", is_alive: 0, spouse: null, remarks: "朱高燧（1383—1431），朱棣第三子。曾参与汉王谋逆，因太子朱高炽庇护免死。", birthday: "1383-01-19", death_date: "1431-10-05", residence: "彰德府" });

  // 朱高炽
  const zhuGC = add({ name: "朱高炽", generation: 3, sibling_order: 1, father_id: zhuDi, gender: "男", title: "明仁宗 · 洪熙皇帝", is_alive: 0, spouse: "张皇后", remarks: "明仁宗朱高炽（1378—1425），朱棣长子。体胖不善骑射，但仁厚好学。即位后年号洪熙，赦免建文旧臣，减税赋。在位仅十个月病逝，却与子宣宗共同奠定了仁宣之治的基础。", birthday: "1378-08-16", death_date: "1425-05-29", residence: "北京顺天府" });

  // 朱瞻基
  const zhuZJ = add({ name: "朱瞻基", generation: 4, sibling_order: 1, father_id: zhuGC, gender: "男", title: "明宣宗 · 宣德皇帝", is_alive: 0, spouse: "胡皇后/孙皇后", remarks: "明宣宗朱瞻基（1399—1435），朱高炽长子。自幼得祖父朱棣宠爱。年号宣德，平定汉王朱高煦叛乱；工书画，尤擅花鸟。开创仁宣之治，为明朝黄金时代。", birthday: "1399-03-16", death_date: "1435-01-31", residence: "北京顺天府" });

  // 英宗 / 代宗
  const zhuQZ = add({ name: "朱祁镇", generation: 5, sibling_order: 1, father_id: zhuZJ, gender: "男", title: "明英宗 · 正统/天顺皇帝", is_alive: 0, spouse: "钱皇后", remarks: "明英宗朱祁镇（1427—1464），朱瞻基长子。9岁即位。1449年受太监王振蛊惑御驾亲征瓦剌，兵败土木堡被俘。其弟朱祁钰即位后尊其为太上皇。1457年石亨等发动夺门之变助其复辟，改元天顺。废除后妃殉葬制度。", birthday: "1427-11-29", death_date: "1464-02-23", residence: "北京顺天府" });
  add({ name: "朱祁钰", generation: 5, sibling_order: 2, father_id: zhuZJ, gender: "男", title: "明代宗 · 景泰皇帝", is_alive: 0, spouse: "汪皇后/杭皇后", remarks: "明代宗朱祁钰（1428—1457），朱瞻基次子。土木之变后临危即位，年号景泰。任用于谦组织北京保卫战。夺门之变中被废为郕王。", birthday: "1428-09-21", death_date: "1457-03-14", residence: "北京顺天府" });

  // 朱见深
  const zhuJS = add({ name: "朱见深", generation: 6, sibling_order: 1, father_id: zhuQZ, gender: "男", title: "明宪宗 · 成化皇帝", is_alive: 0, spouse: "万贵妃", remarks: "明宪宗朱见深（1447—1487），朱祁镇长子。年号成化，在位23年。宠爱年长17岁的万贵妃。设西厂强化特务统治。", birthday: "1447-12-09", death_date: "1487-09-09", residence: "北京顺天府" });

  // 朱祐樘
  const zhuYC = add({ name: "朱祐樘", generation: 7, sibling_order: 1, father_id: zhuJS, gender: "男", title: "明孝宗 · 弘治皇帝", is_alive: 0, spouse: "张皇后", remarks: "明孝宗朱祐樘（1470—1505），朱见深第三子。6岁前被秘密养于安乐堂中躲避万贵妃毒手。年号弘治，勤政爱民，史称弘治中兴。一生只有张皇后一位妻子。", birthday: "1470-07-30", death_date: "1505-06-08", residence: "北京顺天府" });

  // 朱厚照
  add({ name: "朱厚照", generation: 8, sibling_order: 1, father_id: zhuYC, gender: "男", title: "明武宗 · 正德皇帝", is_alive: 0, spouse: "夏皇后", remarks: "明武宗朱厚照（1491—1521），朱祐樘独子。年号正德。最不拘礼法的皇帝：不住乾清宫而建豹房；自封总督军务威武大将军总兵官朱寿。1521年落水得病而亡，无子嗣。", birthday: "1491-10-27", death_date: "1521-04-20", residence: "北京顺天府" });

  // 朱祐杬 → 朱厚熜
  const zhuYYuan = add({ name: "朱祐杬", generation: 7, sibling_order: 4, father_id: zhuJS, gender: "男", title: "兴献王（追尊明睿宗）", is_alive: 0, spouse: "蒋氏", remarks: "朱祐杬（1476—1519），朱见深第四子。封兴王，就藩安陆。其子朱厚熜入继大统后，引发生大礼议之争。", birthday: "1476-07-22", death_date: "1519-07-13", residence: "安陆（今湖北钟祥）" });
  const zhuHC = add({ name: "朱厚熜", generation: 8, sibling_order: 2, father_id: zhuYYuan, gender: "男", title: "明世宗 · 嘉靖皇帝", is_alive: 0, spouse: null, remarks: "明世宗朱厚熜（1507—1567），正德帝无嗣，以堂弟身份入继大统。年号嘉靖，在位45年。早期励精图治；中后期迷信道教，二十多年不上朝。严嵩专权二十年。1542年发生壬寅宫变——十几名宫女趁其熟睡企图勒死他。", birthday: "1507-09-16", death_date: "1567-01-23", residence: "北京顺天府" });

  // 朱载坖
  const zhuZJ2 = add({ name: "朱载坖", generation: 9, sibling_order: 1, father_id: zhuHC, gender: "男", title: "明穆宗 · 隆庆皇帝", is_alive: 0, spouse: "李贵妃/陈皇后", remarks: "明穆宗朱载坖（1537—1572），朱厚熜第三子。年号隆庆。宣布解除海禁（隆庆开关），达成俺答封贡，与蒙古和平互市。", birthday: "1537-03-04", death_date: "1572-07-05", residence: "北京顺天府" });

  // 朱翊钧
  const zhuYJ = add({ name: "朱翊钧", generation: 10, sibling_order: 1, father_id: zhuZJ2, gender: "男", title: "明神宗 · 万历皇帝", is_alive: 0, spouse: "王皇后/郑贵妃", remarks: "明神宗朱翊钧（1563—1620），朱载坖第三子。年号万历，在位48年，明朝在位最长的皇帝。前十年张居正辅政；亲政后因数十年不上朝。万历三大征消耗国力巨大。", birthday: "1563-09-04", death_date: "1620-08-18", residence: "北京顺天府" });

  // 朱常洛
  const zhuCL = add({ name: "朱常洛", generation: 11, sibling_order: 1, father_id: zhuYJ, gender: "男", title: "明光宗 · 泰昌皇帝", is_alive: 0, spouse: "郭皇后/李选侍", remarks: "明光宗朱常洛（1582—1620），朱翊钧长子。做了近二十年太子。即位仅29天即因服用红丸而暴毙，史称一月天子。", birthday: "1582-08-28", death_date: "1620-09-26", residence: "北京顺天府" });

  // 朱由校 / 朱由检
  add({ name: "朱由校", generation: 12, sibling_order: 1, father_id: zhuCL, gender: "男", title: "明熹宗 · 天启皇帝", is_alive: 0, spouse: "张皇后", remarks: "明熹宗朱由校（1605—1627），朱常洛长子。木工手艺极精。大权落于太监魏忠贤和乳母客氏之手。在位期间努尔哈赤攻占辽沈。", birthday: "1605-12-23", death_date: "1627-09-30", residence: "北京顺天府" });
  add({ name: "朱由检", generation: 12, sibling_order: 5, father_id: zhuCL, gender: "男", title: "明思宗 · 崇祯皇帝", is_alive: 0, spouse: "周皇后", remarks: "明思宗朱由检（1611—1644），朱常洛第五子，年号崇祯。在位17年，铲除魏忠贤阉党。1644年李自成攻入北京，在煤山自缢殉国。遗书曰：朕死，无面目见祖宗于地下，自去冠冕，以发覆面。任贼分裂朕尸，勿伤百姓一人。", birthday: "1611-02-06", death_date: "1644-04-25", residence: "北京顺天府" });

  // 重要宗室
  add({ name: "朱常洵", generation: 11, sibling_order: 3, father_id: zhuYJ, gender: "男", title: "福忠王", is_alive: 0, spouse: null, remarks: "朱常洵（1586—1641），万历帝第三子。国本之争核心人物。1641年李自成攻破洛阳被处死。", birthday: "1586-02-22", death_date: "1641-03-02", residence: "洛阳" });

  // 南明三帝
  const zhuCXID = getId("朱常洵");
  add({ name: "朱由崧", generation: 12, sibling_order: 8, father_id: zhuCXID, gender: "男", title: "南明 · 弘光皇帝（明安宗）", is_alive: 0, spouse: null, remarks: "明安宗朱由崧（1607—1646），福王朱常洵长子。崇祯帝自缢后在南京被拥立为帝，在位八个月。清军南下被俘处死。", birthday: "1607-09-05", death_date: "1646-07-01", residence: "南京应天府" });
  add({ name: "朱聿键", generation: 12, sibling_order: 9, father_id: null, gender: "男", title: "南明 · 隆武皇帝（明绍宗）", is_alive: 0, spouse: "曾皇后", remarks: "明绍宗朱聿键（1602—1646），朱元璋九世孙。弘光政权覆灭后在福州被拥立为帝。1646年清军入闽，被俘后绝食而死。", birthday: "1602-05-25", death_date: "1646-10-06", residence: "福州府" });
  add({ name: "朱由榔", generation: 12, sibling_order: 10, father_id: null, gender: "男", title: "南明 · 永历皇帝（明昭宗）", is_alive: 0, spouse: "王皇后", remarks: "明昭宗朱由榔（1623—1662），万历帝之孙。1646年在肇庆被拥立为帝。辗转云贵缅甸之间。1662年被吴三桂俘虏，用弓弦勒死于昆明。永历之死标志着明朝彻底灭亡。", birthday: "1623-11-01", death_date: "1662-06-01", residence: "肇庆府→缅甸→昆明" });
}

// ============================================================
// 扩展SQL（来自 insert-ming-data.sql）
// ============================================================
function seedExtendedSQL(db: SqlJsWrapper) {
  console.log("  正在插入朱元璋其余21子...");

  // --- 朱元璋其余21子 ---
  const zhuYZId = (db.prepare("SELECT id FROM family_members WHERE name = '朱元璋' AND father_id IS NULL").get() as { id: number })?.id;

  const otherSons = [
    { name:"朱橚", so:5, title:"周定王", bday:"1361-10-08", dday:"1425-09-02" },
    { name:"朱桢", so:6, title:"楚昭王", bday:"1364-04-05", dday:"1424-03-22" },
    { name:"朱榑", so:7, title:"齐王", bday:"1364-12-23", dday:"1428-01-01" },
    { name:"朱梓", so:8, title:"潭王", bday:"1369-10-06", dday:"1390-04-01" },
    { name:"朱杞", so:9, title:"早夭", bday:"1369-10-01", dday:"1371-01-01" },
    { name:"朱檀", so:10, title:"鲁荒王", bday:"1370-03-15", dday:"1389-12-22" },
    { name:"朱椿", so:11, title:"蜀献王", bday:"1372-04-06", dday:"1423-03-22" },
    { name:"朱柏", so:12, title:"湘献王", bday:"1371-09-12", dday:"1399-06-01" },
    { name:"朱桂", so:13, title:"代简王", bday:"1374-08-25", dday:"1446-12-29" },
    { name:"朱柍", so:14, title:"早夭", bday:"1374-06-01", dday:"1375-01-01" },
    { name:"朱植", so:15, title:"辽简王", bday:"1377-03-24", dday:"1424-06-04" },
    { name:"朱栴", so:16, title:"庆靖王", bday:"1377-02-06", dday:"1438-08-23" },
    { name:"朱权", so:17, title:"宁献王", bday:"1378-05-27", dday:"1448-10-12" },
    { name:"朱楩", so:18, title:"岷庄王", bday:"1379-04-09", dday:"1450-05-10" },
    { name:"朱橞", so:19, title:"谷王", bday:"1379-05-24", dday:"1428-01-01" },
    { name:"朱松", so:20, title:"韩宪王", bday:"1380-06-26", dday:"1407-11-19" },
    { name:"朱模", so:21, title:"沈简王", bday:"1380-09-01", dday:"1431-06-11" },
    { name:"朱楹", so:22, title:"安惠王", bday:"1383-10-18", dday:"1417-10-22" },
    { name:"朱栋", so:24, title:"郢靖王", bday:"1388-06-21", dday:"1414-11-14" },
    { name:"朱㰘", so:25, title:"伊厉王", bday:"1388-07-09", dday:"1414-10-06" },
    { name:"朱楠", so:26, title:"早夭", bday:"1393-12-01", dday:"1394-01-01" },
  ];

  const sonIds: Record<string, number> = {};
  for (const s of otherSons) {
    const r = db.prepare(
      `INSERT INTO family_members (name, generation, sibling_order, father_id, gender, official_position, is_alive, birthday, death_date, is_root)
       VALUES (?, 2, ?, ?, '男', ?, 0, ?, ?, 0)`
    ).run(s.name, s.so, zhuYZId, s.title, s.bday, s.dday);
    sonIds[s.name] = r.lastInsertRowid!;
  }

  function sid(name: string): number {
    // 先查扩展插入的
    if (sonIds[name]) return sonIds[name];
    // 再查DB中已存在的
    const row = db.prepare("SELECT id FROM family_members WHERE name = ?").get(name) as { id: number } | undefined;
    if (row) return row.id;
    throw new Error(`找不到: ${name}`);
  }

  console.log("  正在插入第3世（孙子辈）...");
  // 朱标之子（朱允炆已在，补充其余）
  const zhuBiaoId = sid("朱标");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱允熥", 2, zhuBiaoId, "1378-11-29");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱允熞", 3, zhuBiaoId, "1385-01-01");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱允熙", 4, zhuBiaoId, "1391-01-01");

  // 朱樉之子
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱尚炳", 1, sid("朱樉"), "1380-11-28");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱尚烈", 2, sid("朱樉"), "1384-01-01");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱尚煜", 3, sid("朱樉"), "1388-01-01");

  // 朱棡之子
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱济熺", 1, sid("朱棡"), "1375-05-14");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱济烨", 2, sid("朱棡"), "1379-01-01");

  // 朱棣第四子（早夭）
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', ?, 0, 0)").run("朱高爔", 4, sid("朱棣"), "1392-01-01");

  // 各藩王之子
  const gen3Inserts: [string, number, string][] = [
    ["朱有燉", 1, "朱橚"], ["朱有爋", 2, "朱橚"],
    ["朱孟烷", 1, "朱桢"],
    ["朱贤烶", 1, "朱榑"],
    ["朱肇煇", 1, "朱檀"],
    ["朱悦燫", 1, "朱椿"], ["朱悦熑", 2, "朱椿"],
    ["朱逊煓", 1, "朱桂"],
    ["朱贵烚", 1, "朱植"],
    ["朱秩煃", 1, "朱栴"],
    ["朱盘烒", 1, "朱权"],
    ["朱徽煣", 1, "朱楩"],
    ["朱赋灼", 1, "朱橞"],
    ["朱冲𤊨", 1, "朱松"],
    ["朱佶焞", 1, "朱模"],
    ["朱颙炔", 1, "朱㰘"],
  ];
  for (const [name, so, father] of gen3Inserts) {
    db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 3, ?, ?, '男', '1400-01-01', 0, 0)").run(name, so, sid(father));
  }

  // 朱允炆之子
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 4, ?, ?, '男', ?, 0, 0)").run("朱文奎", 1, sid("朱允炆"), "1396-11-30");
  db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 4, ?, ?, '男', ?, 0, 0)").run("朱文圭", 2, sid("朱允炆"), "1401-01-01");

  console.log("  正在插入第4世（曾孙辈）...");
  const gen4Inserts: [string, number, string, string][] = [
    ["朱志堩", 1, "朱尚炳", "1404-01-01"],
    ["朱子垕", 1, "朱有燉", "1400-01-01"],
    ["朱季埱", 1, "朱孟烷", "1400-01-01"],
    ["朱友垓", 1, "朱悦熑", "1409-01-01"],
    ["朱仕壥", 1, "朱逊煓", "1410-01-01"],
    ["朱豪墭", 1, "朱贵烚", "1420-01-01"],
    ["朱奠培", 1, "朱盘烒", "1418-01-01"],
    ["朱音埑", 1, "朱徽煣", "1430-01-01"],
    ["朱范圮", 1, "朱冲𤊨", "1420-01-01"],
    ["朱幼㙾", 1, "朱佶焞", "1432-01-01"],
    ["朱勉堡", 1, "朱颙炔", "1435-01-01"],
    ["朱美圭", 1, "朱济熺", "1399-01-01"],
    ["朱邃𡓱", 1, "朱秩煃", "1435-01-01"],
    ["朱泰堪", 1, "朱肇煇", "1411-01-01"],
  ];
  for (const [name, so, father, bday] of gen4Inserts) {
    db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 4, ?, ?, '男', ?, 0, 0)").run(name, so, sid(father), bday);
  }

  console.log("  正在插入第5-12世...");
  // 第5世
  const gen5Inserts: [string, string, string][] = [
    ["朱公锡", "朱志堩", "1437-01-01"], ["朱子埅", "朱子垕", "1420-01-01"],
    ["朱均鈋", "朱季埱", "1420-01-01"], ["朱申鈘", "朱友垓", "1440-01-01"],
    ["朱成鐭", "朱仕壥", "1440-01-01"], ["朱觐钧", "朱奠培", "1440-01-01"],
    ["朱诠钲", "朱幼㙾", "1460-01-01"], ["朱钟铉", "朱美圭", "1428-01-01"],
    ["朱阳铸", "朱泰堪", "1448-01-01"], ["朱弥钳", "朱芝址", "1462-01-01"],
    ["朱芝址", "朱琼烃", "1435-01-01"],
  ];
  for (const [name, father, bday] of gen5Inserts) {
    try {
      db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 5, 1, ?, '男', ?, 0, 0)").run(name, sid(father), bday);
    } catch { /* 父ID不存在则跳过 */ }
  }

  // 第6世
  const gen6Inserts: [string, string, string][] = [
    ["朱诚泳", "朱公锡", "1458-01-01"], ["朱同镳", "朱子埅", "1440-01-01"],
    ["朱奇源", "朱钟铉", "1450-01-01"], ["朱宾瀚", "朱申鈘", "1465-01-01"],
    ["朱荣㳦", "朱均鈋", "1450-01-01"], ["朱聪沬", "朱成鐭", "1465-01-01"],
    ["朱偕灊", "朱范圮", "1450-01-01"], ["朱勋潪", "朱诠钲", "1485-01-01"],
    ["朱寘錖", "朱邃𡓱", "1460-01-01"], ["朱諟鋢", "朱勉堡", "1460-01-01"],
    ["朱膺鉟", "朱音埑", "1450-01-01"], ["朱恩鉹", "朱豪墭", "1440-01-01"],
    ["朱当漎", "朱阳铸", "1475-01-01"], ["朱宸濠", "朱觐钧", "1476-01-01"],
    ["朱弥鍗", "朱芝址", "1460-01-01"],
  ];
  for (const [name, father, bday] of gen6Inserts) {
    try { db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 6, 1, ?, '男', ?, 0, 0)").run(name, sid(father), bday); } catch {}
  }

  // 第7世
  const gen7Inserts: [string, string, string][] = [
    ["朱表荣", "朱奇源", "1470-01-01"], ["朱睦柛", "朱同镳", "1460-01-01"],
    ["朱让栩", "朱宾瀚", "1490-01-01"], ["朱显榕", "朱荣㳦", "1470-01-01"],
    ["朱俊杕", "朱聪沬", "1490-01-01"], ["朱旭櫏", "朱偕灊", "1470-01-01"],
    ["朱胤栘", "朱勋潪", "1510-01-01"], ["朱宠涭", "朱恩鉹", "1470-01-01"],
    ["朱健杙", "朱当漎", "1500-01-01"], ["朱訏渊", "朱諟鋢", "1485-01-01"],
  ];
  for (const [name, father, bday] of gen7Inserts) {
    try { db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 7, 1, ?, '男', ?, 0, 0)").run(name, sid(father), bday); } catch {}
  }

  // 第8世
  const gen8Inserts: [string, string, string][] = [
    ["朱知烊", "朱表荣", "1490-01-01"], ["朱承爚", "朱让栩", "1515-01-01"],
    ["朱英耀", "朱显榕", "1495-01-01"], ["朱充燿", "朱俊杕", "1510-01-01"],
    ["朱融燧", "朱旭櫏", "1495-01-01"], ["朱恬烄", "朱胤栘", "1535-01-01"],
    ["朱致格", "朱宠涭", "1495-01-01"], ["朱观𤊟", "朱健杙", "1525-01-01"],
    ["朱典楧", "朱訏渊", "1510-01-01"], ["朱勤熄", "朱睦柛", "1490-01-01"],
  ];
  for (const [name, father, bday] of gen8Inserts) {
    try { db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 8, 1, ?, '男', ?, 0, 0)").run(name, sid(father), bday); } catch {}
  }

  // 第9世
  const gen9Inserts: [string, string, string][] = [
    ["朱宣圻", "朱承爚", "1540-01-01"], ["朱华奎", "朱英耀", "1570-01-01"],
    ["朱廷埼", "朱充燿", "1535-01-01"], ["朱谟㙉", "朱融燧", "1520-01-01"],
    ["朱珵尧", "朱恬烄", "1560-01-01"], ["朱颐坦", "朱观𤊟", "1550-01-01"],
    ["朱褒㸅", "朱典楧", "1540-01-01"], ["朱朝堈", "朱勤熄", "1520-01-01"],
  ];
  for (const [name, father, bday] of gen9Inserts) {
    try { db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 9, 1, ?, '男', ?, 0, 0)").run(name, sid(father), bday); } catch {}
  }

  // 第10世
  const gen10Inserts: [string, string, string][] = [
    ["朱奉铨", "朱宣圻", "1565-01-01"],
  ];
  for (const [name, father, bday] of gen10Inserts) {
    try { db.prepare("INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root) VALUES (?, 10, 1, ?, '男', ?, 0, 0)").run(name, sid(father), bday); } catch {}
  }

  // --- 配偶 ---
  console.log("  正在插入配偶数据...");
  const spouseInserts: [string, string][] = [
    ["朱橚", "冯氏"], ["朱桢", "王氏"], ["朱植", "郭氏"],
    ["朱权", "张氏"], ["朱檀", "汤氏"], ["朱桂", "徐氏"],
    ["朱楩", "袁氏"],
  ];
  for (const [member, spouse] of spouseInserts) {
    try {
      const mid = sid(member);
      db.prepare("INSERT INTO spouses (member_id, name, sort_order) VALUES (?, ?, 0)").run(mid, spouse);
    } catch {}
  }

  // 马皇后
  try {
    const zhuYZId2 = sid("朱元璋");
    db.prepare("INSERT INTO spouses (member_id, name, sort_order) VALUES (?, ?, 0)").run(zhuYZId2, "马皇后");
  } catch {}
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  console.log("正在构建明朝皇族 demo 数据库...");

  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON");
  const wrapper = new SqlJsWrapper(db);

  initTables(wrapper);
  console.log("✓ 表结构已创建");

  console.log("正在插入皇帝世系...");
  seedMing(wrapper);

  console.log("正在插入扩展宗室...");
  seedExtendedSQL(wrapper);

  // 设朱元璋为 root
  const zhuYZRow = wrapper.prepare("SELECT id FROM family_members WHERE name = '朱元璋' AND father_id IS NULL").get() as { id: number } | undefined;
  if (zhuYZRow) {
    wrapper.prepare("UPDATE family_members SET is_root = 1 WHERE id = ?").run(zhuYZRow.id);
  }

  // 添加 admin 用户
  const bcrypt = (await import("bcryptjs")).default;
  const passwordHash = await bcrypt.hash("admin", 10);
  wrapper.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("admin", passwordHash);

  // 写入文件
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));

  const count = wrapper.prepare("SELECT COUNT(*) as c FROM family_members").get() as { c: number };
  const spouseCount = wrapper.prepare("SELECT COUNT(*) as c FROM spouses").get() as { c: number };
  console.log(`✓ 完成！共 ${count.c} 位家族成员，${spouseCount.c} 条配偶记录`);
  console.log(`  数据库文件: ${DB_PATH}`);

  db.close();
}

main().catch((err) => {
  console.error("构建失败:", err);
  process.exit(1);
});

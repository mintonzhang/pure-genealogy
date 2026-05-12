-- ============================================================
-- 明朝皇室族谱数据 - 从朱元璋开始，递归录入所有子嗣
-- 数据来源：明史·诸王传
-- ============================================================

-- 第1世：朱元璋（已存在 id=1，设 is_root）
-- 第2世：朱元璋26个儿子（现有5个：id=2朱樉, id=3朱棡, id=4朱标, id=6朱棣, id=28朱桱）

-- 先插入缺失的21个儿子，记录其 ID

-- 5. 朱橚 (1361-1425) 周定王 -- sibling_order = 5
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱橚', 2, 5, 1, '男', '1361-10-08', '1425-09-02', 0, 0);
-- -> id = 36

-- 6. 朱桢 (1364-1424) 楚昭王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱桢', 2, 6, 1, '男', '1364-04-05', '1424-03-22', 0, 0);
-- -> id = 37

-- 7. 朱榑 (1364-1428) 齐王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱榑', 2, 7, 1, '男', '1364-12-23', '1428-01-01', 0, 0);
-- -> id = 38

-- 8. 朱梓 (1369-1390) 潭王（无子）
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱梓', 2, 8, 1, '男', '1369-10-06', '1390-04-01', 0, 0);
-- -> id = 39

-- 9. 朱杞 (1369-1371) 早夭
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱杞', 2, 9, 1, '男', '1369-10-01', '1371-01-01', 0, 0);
-- -> id = 40

-- 10. 朱檀 (1370-1389) 鲁荒王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱檀', 2, 10, 1, '男', '1370-03-15', '1389-12-22', 0, 0);
-- -> id = 41

-- 11. 朱椿 (1372-1423) 蜀献王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱椿', 2, 11, 1, '男', '1372-04-06', '1423-03-22', 0, 0);
-- -> id = 42

-- 12. 朱柏 (1371-1399) 湘献王（无子）
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱柏', 2, 12, 1, '男', '1371-09-12', '1399-06-01', 0, 0);
-- -> id = 43

-- 13. 朱桂 (1374-1446) 代简王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱桂', 2, 13, 1, '男', '1374-08-25', '1446-12-29', 0, 0);
-- -> id = 44

-- 14. 朱柍 (1374-1375) 早夭
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱柍', 2, 14, 1, '男', '1374-06-01', '1375-01-01', 0, 0);
-- -> id = 45

-- 15. 朱植 (1377-1424) 辽简王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱植', 2, 15, 1, '男', '1377-03-24', '1424-06-04', 0, 0);
-- -> id = 46

-- 16. 朱栴 (1377-1438) 庆靖王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱栴', 2, 16, 1, '男', '1377-02-06', '1438-08-23', 0, 0);
-- -> id = 47

-- 17. 朱权 (1378-1448) 宁献王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱权', 2, 17, 1, '男', '1378-05-27', '1448-10-12', 0, 0);
-- -> id = 48

-- 18. 朱楩 (1379-1450) 岷庄王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱楩', 2, 18, 1, '男', '1379-04-09', '1450-05-10', 0, 0);
-- -> id = 49

-- 19. 朱橞 (1379-1428) 谷王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱橞', 2, 19, 1, '男', '1379-05-24', '1428-01-01', 0, 0);
-- -> id = 50

-- 20. 朱松 (1380-1407) 韩宪王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱松', 2, 20, 1, '男', '1380-06-26', '1407-11-19', 0, 0);
-- -> id = 51

-- 21. 朱模 (1380-1431) 沈简王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱模', 2, 21, 1, '男', '1380-09-01', '1431-06-11', 0, 0);
-- -> id = 52

-- 22. 朱楹 (1383-1417) 安惠王（无子）
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱楹', 2, 22, 1, '男', '1383-10-18', '1417-10-22', 0, 0);
-- -> id = 53

-- 23. 朱桱 唐定王 已在DB (id=28) ✓

-- 24. 朱栋 (1388-1414) 郢靖王（无子）
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱栋', 2, 24, 1, '男', '1388-06-21', '1414-11-14', 0, 0);
-- -> id = 54

-- 25. 朱㰘 (1388-1414) 伊厉王
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱㰘', 2, 25, 1, '男', '1388-07-09', '1414-10-06', 0, 0);
-- -> id = 55

-- 26. 朱楠 (1393-1394) 早夭
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
VALUES ('朱楠', 2, 26, 1, '男', '1393-12-01', '1394-01-01', 0, 0);
-- -> id = 56


-- ============================================================
-- 第3世：朱元璋孙子辈 - 各藩王之子
-- ============================================================

-- === 朱标系 (id=4) ===
-- 朱标五子：朱允熥、朱允炆(已有id=5)、朱允熥、朱允熞、朱允熙
-- 朱允炆已存在 id=5
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱允熥', 3, 2, 4, '男', '1378-11-29', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱允熞', 3, 3, 4, '男', '1385-01-01', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱允熙', 3, 4, 4, '男', '1391-01-01', 0, 0);

-- === 朱樉系 (id=2) ===
-- 朱樉子：朱尚炳(袭秦王)、朱尚烈、朱尚煜、朱尚烐
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱尚炳', 3, 1, 2, '男', '1380-11-28', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱尚烈', 3, 2, 2, '男', '1384-01-01', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱尚煜', 3, 3, 2, '男', '1388-01-01', 0, 0);

-- === 朱棡系 (id=3) ===
-- 朱棡子：朱济熺(袭晋王)、朱济烨、朱济熿、朱济炫、朱济焕、朱济烺、朱济熼
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱济熺', 3, 1, 3, '男', '1375-05-14', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱济烨', 3, 2, 3, '男', '1379-01-01', 0, 0);

-- === 朱棣系 (id=6) ===
-- 朱高炽(id=9)、朱高煦(id=7)、朱高燧(id=8) 已在DB ✓
-- 朱棣第四子：朱高爔(早夭)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱高爔', 3, 4, 6, '男', '1392-01-01', 0, 0);

-- === 朱橚系 (id=36) ===
-- 朱橚子：朱有燉(袭周王)、朱有爋、朱有烜、朱有熺、朱有灮、朱有煽等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱有燉', 3, 1, 36, '男', '1379-02-06', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱有爋', 3, 2, 36, '男', '1380-01-01', 0, 0);

-- === 朱桢系 (id=37) ===
-- 朱桢子：朱孟烷(袭楚王)、朱孟熜、朱孟炯、朱孟焯等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱孟烷', 3, 1, 37, '男', '1382-01-01', 0, 0);

-- === 朱榑系 (id=38) ===
-- 朱榑子：朱贤烶(废为庶人)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱贤烶', 3, 1, 38, '男', '1385-01-01', 0, 0);

-- === 朱檀系 (id=41) ===
-- 朱檀子：朱肇煇(袭鲁王)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱肇煇', 3, 1, 41, '男', '1388-07-15', 0, 0);

-- === 朱椿系 (id=42) ===
-- 朱椿子：朱悦燫(早逝)、朱悦熑(袭蜀王)、朱悦燿、朱悦熑等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱悦燫', 3, 1, 42, '男', '1388-01-01', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱悦熑', 3, 2, 42, '男', '1390-01-01', 0, 0);

-- === 朱桂系 (id=44) ===
-- 朱桂子：朱逊煓(早逝，追封代王)、朱逊𤆼等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱逊煓', 3, 1, 44, '男', '1390-01-01', 0, 0);

-- === 朱植系 (id=46) ===
-- 朱植子：朱贵煐(早逝)、朱贵烚(袭辽王)、朱贵燮等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱贵烚', 3, 1, 46, '男', '1397-01-01', 0, 0);

-- === 朱栴系 (id=47) ===
-- 朱栴子：朱秩煃(袭庆王)等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱秩煃', 3, 1, 47, '男', '1415-01-01', 0, 0);

-- === 朱权系 (id=48) ===
-- 朱权子：朱盘烒(早逝，追封宁王)等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱盘烒', 3, 1, 48, '男', '1395-10-16', 0, 0);

-- === 朱楩系 (id=49) ===
-- 朱楩子：朱徽焲(早逝)、朱徽煣(袭岷王)等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱徽煣', 3, 1, 49, '男', '1400-01-01', 0, 0);

-- === 朱橞系 (id=50) ===
-- 朱橞子：朱赋灼、朱赋爚等（谷王被废,子孙降为庶人）
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱赋灼', 3, 1, 50, '男', '1400-01-01', 0, 0);

-- === 朱松系 (id=51) ===
-- 朱松子：朱冲𤊨(袭韩王)等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱冲𤊨', 3, 1, 51, '男', '1400-01-01', 0, 0);

-- === 朱模系 (id=52) ===
-- 朱模子：朱佶焞(袭沈王)等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱佶焞', 3, 1, 52, '男', '1407-01-01', 0, 0);

-- === 朱㰘系 (id=55) ===
-- 朱㰘子：朱颙炔(袭伊王)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱颙炔', 3, 1, 55, '男', '1413-01-01', 0, 0);

-- === 朱允炆系 (id=5) ===
-- 朱允炆子：朱文奎、朱文圭
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱文奎', 4, 1, 5, '男', '1396-11-30', 0, 0);
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
VALUES ('朱文圭', 4, 2, 5, '男', '1401-01-01', 0, 0);


-- ============================================================
-- 第4世：主要藩王继承人（第三代藩王）
-- ============================================================

-- === 秦王系 朱尚炳(id从上面来，sibling_order=1, father_id=2) 子 ===
-- 朱尚炳子：朱志堩(袭秦王)、朱志均、朱志𡐤等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱志堩', 4, 1, id, '男', '1404-01-01', 0, 0 FROM family_members WHERE name = '朱尚炳' AND father_id = 2;

-- === 周王系 朱有燉(父id=36) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱子垕', 4, 1, id, '男', '1400-01-01', 0, 0 FROM family_members WHERE name = '朱有燉' AND father_id = 36;

-- === 楚王系 朱孟烷(父id=37) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱季埱', 4, 1, id, '男', '1400-01-01', 0, 0 FROM family_members WHERE name = '朱孟烷' AND father_id = 37;

-- === 鲁王系 见后续完整世代链 ===

-- === 蜀王系 朱悦熑(父id=42) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱友垓', 4, 1, id, '男', '1409-01-01', 0, 0 FROM family_members WHERE name = '朱悦熑' AND father_id = 42;

-- === 代王系 朱逊煓(父id=44) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱仕壥', 4, 1, id, '男', '1410-01-01', 0, 0 FROM family_members WHERE name = '朱逊煓' AND father_id = 44;

-- === 辽王系 朱贵烚(父id=46) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱豪墭', 4, 1, id, '男', '1420-01-01', 0, 0 FROM family_members WHERE name = '朱贵烚' AND father_id = 46;

-- === 宁王系 朱盘烒(父id=48) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱奠培', 4, 1, id, '男', '1418-01-01', 0, 0 FROM family_members WHERE name = '朱盘烒' AND father_id = 48;

-- === 岷王系 朱徽煣(父id=49) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱音埑', 4, 1, id, '男', '1430-01-01', 0, 0 FROM family_members WHERE name = '朱徽煣' AND father_id = 49;

-- === 韩王系 朱冲𤊨(父id=51) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱范圮', 4, 1, id, '男', '1420-01-01', 0, 0 FROM family_members WHERE name = '朱冲𤊨' AND father_id = 51;

-- === 沈王系 朱佶焞(父id=52) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱幼㙾', 4, 1, id, '男', '1432-01-01', 0, 0 FROM family_members WHERE name = '朱佶焞' AND father_id = 52;

-- === 伊王系 朱颙炔(父id=55) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱勉堡', 4, 1, id, '男', '1435-01-01', 0, 0 FROM family_members WHERE name = '朱颙炔' AND father_id = 55;

-- === 晋王系 朱济熺(父id=3) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱美圭', 4, 1, id, '男', '1399-01-01', 0, 0 FROM family_members WHERE name = '朱济熺' AND father_id = 3;

-- === 庆王系 朱秩煃(父id=47) 子 ===
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱邃𡓱', 4, 1, id, '男', '1435-01-01', 0, 0 FROM family_members WHERE name = '朱秩煃' AND father_id = 47;

-- === 朱允炆已经放在上面了，属于generation 4 ===


-- ============================================================
-- 第5-12世：主系明帝延续（朱棣→朱高炽→朱瞻基...）已在DB中完整 ✓
-- 这里补充其他藩王的第5代及以后继承人
-- ============================================================

-- 秦王系 第5代 朱志堩 → 朱公锡等
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱公锡', 5, 1, id, '男', '1437-01-01', 0, 0 FROM family_members WHERE name = '朱志堩' AND father_id = 2;

-- 周王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱子埅', 5, 1, id, '男', '1420-01-01', 0, 0 FROM family_members WHERE name = '朱子垕' AND father_id = 36;

-- 楚王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱均鈋', 5, 1, id, '男', '1420-01-01', 0, 0 FROM family_members WHERE name = '朱季埱' AND father_id = 37;

-- 蜀王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱申鈘', 5, 1, id, '男', '1440-01-01', 0, 0 FROM family_members WHERE name = '朱友垓' AND father_id = 42;

-- 代王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱成鐭', 5, 1, id, '男', '1440-01-01', 0, 0 FROM family_members WHERE name = '朱仕壥' AND father_id = 44;

-- 宁王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱觐钧', 5, 1, id, '男', '1440-01-01', 0, 0 FROM family_members WHERE name = '朱奠培' AND father_id = 48;

-- 沈王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱诠钲', 5, 1, id, '男', '1460-01-01', 0, 0 FROM family_members WHERE name = '朱幼㙾' AND father_id = 52;

-- 晋王系 第5代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱钟铉', 5, 1, id, '男', '1428-01-01', 0, 0 FROM family_members WHERE name = '朱美圭' AND father_id = 3;


-- ============================================================
-- 第6世：继续各藩王系
-- ============================================================

-- 秦王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱诚泳', 6, 1, id, '男', '1458-01-01', 0, 0 FROM family_members WHERE name = '朱公锡' AND father_id = 2;

-- 周王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱同镳', 6, 1, id, '男', '1440-01-01', 0, 0 FROM family_members WHERE name = '朱子埅' AND father_id = 36;

-- 晋王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱奇源', 6, 1, id, '男', '1450-01-01', 0, 0 FROM family_members WHERE name = '朱钟铉' AND father_id = 3;

-- 蜀王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱宾瀚', 6, 1, id, '男', '1465-01-01', 0, 0 FROM family_members WHERE name = '朱申鈘' AND father_id = 42;

-- 楚王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱荣㳦', 6, 1, id, '男', '1450-01-01', 0, 0 FROM family_members WHERE name = '朱均鈋' AND father_id = 37;

-- 代王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱聪沬', 6, 1, id, '男', '1465-01-01', 0, 0 FROM family_members WHERE name = '朱成鐭' AND father_id = 44;

-- 韩王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱偕灊', 6, 1, id, '男', '1450-01-01', 0, 0 FROM family_members WHERE name = '朱范圮' AND father_id = 51;

-- 沈王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱勋潪', 6, 1, id, '男', '1485-01-01', 0, 0 FROM family_members WHERE name = '朱诠钲' AND father_id = 52;

-- 庆王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱寘錖', 6, 1, id, '男', '1460-01-01', 0, 0 FROM family_members WHERE name = '朱邃𡓱' AND father_id = 47;

-- 伊王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱諟鋢', 6, 1, id, '男', '1460-01-01', 0, 0 FROM family_members WHERE name = '朱勉堡' AND father_id = 55;

-- 岷王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱膺鉟', 6, 1, id, '男', '1450-01-01', 0, 0 FROM family_members WHERE name = '朱音埑' AND father_id = 49;

-- 辽王系 第6代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱恩鉹', 6, 1, id, '男', '1440-01-01', 0, 0 FROM family_members WHERE name = '朱豪墭' AND father_id = 46;

-- 唐王系 第6代（唐王一脉后续，朱桱→朱琼烃→朱芝址后，继续）
-- 朱芝址(id=30) → 朱弥鍗(id=31) 已在DB，补充另一个儿子朱弥钳
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱弥钳', 5, 2, id, '男', '1462-01-01', 0, 0 FROM family_members WHERE name = '朱芝址' AND father_id = 29;


-- ============================================================
-- 第7-8世：继续关键藩王系
-- ============================================================

-- 晋王系 第7-8代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱表荣', 7, 1, id, '男', '1470-01-01', 0, 0 FROM family_members WHERE name = '朱奇源' AND father_id = 3;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱知烊', 8, 1, id, '男', '1490-01-01', 0, 0 FROM family_members WHERE name = '朱表荣' AND father_id = 3;

-- 周王系 第7代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱睦柛', 7, 1, id, '男', '1460-01-01', 0, 0 FROM family_members WHERE name = '朱同镳' AND father_id = 36;

-- 蜀王系 第7-8代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱让栩', 7, 1, id, '男', '1490-01-01', 0, 0 FROM family_members WHERE name = '朱宾瀚' AND father_id = 42;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱承爚', 8, 1, id, '男', '1515-01-01', 0, 0 FROM family_members WHERE name = '朱让栩' AND father_id = 42;

-- 楚王系 第7代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱显榕', 7, 1, id, '男', '1470-01-01', 0, 0 FROM family_members WHERE name = '朱荣㳦' AND father_id = 37;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱英耀', 8, 1, id, '男', '1495-01-01', 0, 0 FROM family_members WHERE name = '朱显榕' AND father_id = 37;

-- 代王系 第7-8代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱俊杕', 7, 1, id, '男', '1490-01-01', 0, 0 FROM family_members WHERE name = '朱聪沬' AND father_id = 44;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱充燿', 8, 1, id, '男', '1510-01-01', 0, 0 FROM family_members WHERE name = '朱俊杕' AND father_id = 44;

-- 韩王系 第7-8代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱旭櫏', 7, 1, id, '男', '1470-01-01', 0, 0 FROM family_members WHERE name = '朱偕灊' AND father_id = 51;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱融燧', 8, 1, id, '男', '1495-01-01', 0, 0 FROM family_members WHERE name = '朱旭櫏' AND father_id = 51;

-- 沈王系 第7-8代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱胤栘', 7, 1, id, '男', '1510-01-01', 0, 0 FROM family_members WHERE name = '朱勋潪' AND father_id = 52;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱恬烄', 8, 1, id, '男', '1535-01-01', 0, 0 FROM family_members WHERE name = '朱胤栘' AND father_id = 52;

-- 宁王系 第7-8代(朱宸濠叛乱后宁王封号被废)
-- 朱觐钧 → 朱宸濠(宁王之乱)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, death_date, is_alive, is_root)
SELECT '朱宸濠', 6, 1, id, '男', '1476-01-01', '1521-01-13', 0, 0 FROM family_members WHERE name = '朱觐钧' AND father_id = 48;

-- 伊王系 第7代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱訏渊', 7, 1, id, '男', '1485-01-01', 0, 0 FROM family_members WHERE name = '朱諟鋢' AND father_id = 55;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱典楧', 8, 1, id, '男', '1510-01-01', 0, 0 FROM family_members WHERE name = '朱訏渊' AND father_id = 55;

-- 鲁王系 第5-10代
-- 朱肇煇(gen3)→朱泰堪(gen4)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱泰堪', 4, 1, id, '男', '1411-01-01', 0, 0 FROM family_members WHERE name = '朱肇煇' AND father_id = 41;
-- 朱阳铸(gen5)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱阳铸', 5, 1, id, '男', '1448-01-01', 0, 0 FROM family_members WHERE name = '朱泰堪' AND father_id = 41;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱当漎', 6, 1, id, '男', '1475-01-01', 0, 0 FROM family_members WHERE name = '朱阳铸' AND father_id = 41;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱健杙', 7, 1, id, '男', '1500-01-01', 0, 0 FROM family_members WHERE name = '朱当漎' AND father_id = 41;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱观𤊟', 8, 1, id, '男', '1525-01-01', 0, 0 FROM family_members WHERE name = '朱健杙' AND father_id = 41;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱颐坦', 9, 1, id, '男', '1550-01-01', 0, 0 FROM family_members WHERE name = '朱观𤊟' AND father_id = 41;

-- 辽王系 第7-8代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱宠涭', 7, 1, id, '男', '1470-01-01', 0, 0 FROM family_members WHERE name = '朱恩鉹' AND father_id = 46;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱致格', 8, 1, id, '男', '1495-01-01', 0, 0 FROM family_members WHERE name = '朱宠涭' AND father_id = 46;


-- ============================================================
-- 第9-12世：明后期延续
-- ============================================================

-- 蜀王系 第9-10代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱宣圻', 9, 1, id, '男', '1540-01-01', 0, 0 FROM family_members WHERE name = '朱承爚' AND father_id = 42;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱奉铨', 10, 1, id, '男', '1565-01-01', 0, 0 FROM family_members WHERE name = '朱宣圻' AND father_id = 42;

-- 楚王系 第9代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱华奎', 9, 1, id, '男', '1570-01-01', 0, 0 FROM family_members WHERE name = '朱英耀' AND father_id = 37;

-- 代王系 第9代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱廷埼', 9, 1, id, '男', '1535-01-01', 0, 0 FROM family_members WHERE name = '朱充燿' AND father_id = 44;

-- 韩王系 第9代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱谟㙉', 9, 1, id, '男', '1520-01-01', 0, 0 FROM family_members WHERE name = '朱融燧' AND father_id = 51;

-- 沈王系 第9代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱珵尧', 9, 1, id, '男', '1560-01-01', 0, 0 FROM family_members WHERE name = '朱恬烄' AND father_id = 52;

-- 周王系 第8-9代
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱勤熄', 8, 1, id, '男', '1490-01-01', 0, 0 FROM family_members WHERE name = '朱睦柛' AND father_id = 36;
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱朝堈', 9, 1, id, '男', '1520-01-01', 0, 0 FROM family_members WHERE name = '朱勤熄' AND father_id = 36;

-- 唐王系 第9代：朱硕熿(id=34) → 朱器墭(id=35) 已在DB ✓
-- 继续：朱聿键(id=25) 已在DB ✓

-- 伊王系 第9代(伊王朱典楧被废,改由其他支系)
INSERT INTO family_members (name, generation, sibling_order, father_id, gender, birthday, is_alive, is_root)
SELECT '朱褒㸅', 9, 1, id, '男', '1540-01-01', 0, 0 FROM family_members WHERE name = '朱典楧' AND father_id = 55;


-- ============================================================
-- 补充配偶数据（主要后妃）
-- ============================================================

-- 朱橚 周王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '冯氏', 0 FROM family_members WHERE name = '朱橚' AND father_id = 1;
-- 朱桢 楚王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '王氏', 0 FROM family_members WHERE name = '朱桢' AND father_id = 1;
-- 朱植 辽王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '郭氏', 0 FROM family_members WHERE name = '朱植' AND father_id = 1;
-- 朱权 宁王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '张氏', 0 FROM family_members WHERE name = '朱权' AND father_id = 1;
-- 朱檀 鲁王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '汤氏', 0 FROM family_members WHERE name = '朱檀' AND father_id = 1;
-- 朱桂 代王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '徐氏', 0 FROM family_members WHERE name = '朱桂' AND father_id = 1;
-- 朱楩 岷王妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '袁氏', 0 FROM family_members WHERE name = '朱楩' AND father_id = 1;

-- 朱常瀛 妃
INSERT INTO spouses (member_id, name, sort_order) SELECT id, '马氏/王氏', 0 FROM family_members WHERE name = '朱常瀛' AND father_id = 19;

-- 朱元璋补充马皇后关联（已有记录id=1）
UPDATE spouses SET name = '马皇后' WHERE member_id = 1;

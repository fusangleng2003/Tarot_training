#!/usr/bin/env python3
"""
从 Internet Archive 下载 Rider-Waite 塔罗牌图片（公版，CC0）
并重命名为项目所需格式（major-00.jpg, wands-01.jpg, 等）
图片为 PNG 格式，下载后转换为 JPG 节省空间
"""

import os
import time
import requests
from pathlib import Path
from PIL import Image
import io

OUTPUT_DIR = Path(__file__).parent / "public" / "images" / "cards"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = "https://archive.org/download/rider-waite-tarot"

# (Internet Archive 文件名, 项目目标文件名)
CARD_MAP = [
    # ── 大阿卡纳 (Major Arcana) 22张，按编号排列 ──
    ("major_arcana_fool.png",        "major-00.jpg"),
    ("major_arcana_magician.png",    "major-01.jpg"),
    ("major_arcana_priestess.png",   "major-02.jpg"),
    ("major_arcana_empress.png",     "major-03.jpg"),
    ("major_arcana_emperor.png",     "major-04.jpg"),
    ("major_arcana_hierophant.png",  "major-05.jpg"),
    ("major_arcana_lovers.png",      "major-06.jpg"),
    ("major_arcana_chariot.png",     "major-07.jpg"),
    ("major_arcana_strength.png",    "major-08.jpg"),
    ("major_arcana_hermit.png",      "major-09.jpg"),
    ("major_arcana_fortune.png",     "major-10.jpg"),
    ("major_arcana_justice.png",     "major-11.jpg"),
    ("major_arcana_hanged.png",      "major-12.jpg"),
    ("major_arcana_death.png",       "major-13.jpg"),
    ("major_arcana_temperance.png",  "major-14.jpg"),
    ("major_arcana_devil.png",       "major-15.jpg"),
    ("major_arcana_tower.png",       "major-16.jpg"),
    ("major_arcana_star.png",        "major-17.jpg"),
    ("major_arcana_moon.png",        "major-18.jpg"),
    ("major_arcana_sun.png",         "major-19.jpg"),
    ("major_arcana_judgement.png",   "major-20.jpg"),
    ("major_arcana_world.png",       "major-21.jpg"),

    # ── 权杖 (Wands) 14张：Ace=01, 2-10=02-10, Page=11, Knight=12, Queen=13, King=14 ──
    ("minor_arcana_wands_ace.png",    "wands-01.jpg"),
    ("minor_arcana_wands_2.png",      "wands-02.jpg"),
    ("minor_arcana_wands_3.png",      "wands-03.jpg"),
    ("minor_arcana_wands_4.png",      "wands-04.jpg"),
    ("minor_arcana_wands_5.png",      "wands-05.jpg"),
    ("minor_arcana_wands_6.png",      "wands-06.jpg"),
    ("minor_arcana_wands_7.png",      "wands-07.jpg"),
    ("minor_arcana_wands_8.png",      "wands-08.jpg"),
    ("minor_arcana_wands_9.png",      "wands-09.jpg"),
    ("minor_arcana_wands_10.png",     "wands-10.jpg"),
    ("minor_arcana_wands_page.png",   "wands-11.jpg"),
    ("minor_arcana_wands_knight.png", "wands-12.jpg"),
    ("minor_arcana_wands_queen.png",  "wands-13.jpg"),
    ("minor_arcana_wands_king.png",   "wands-14.jpg"),

    # ── 圣杯 (Cups) 14张 ──
    ("minor_arcana_cups_ace.png",    "cups-01.jpg"),
    ("minor_arcana_cups_2.png",      "cups-02.jpg"),
    ("minor_arcana_cups_3.png",      "cups-03.jpg"),
    ("minor_arcana_cups_4.png",      "cups-04.jpg"),
    ("minor_arcana_cups_5.png",      "cups-05.jpg"),
    ("minor_arcana_cups_6.png",      "cups-06.jpg"),
    ("minor_arcana_cups_7.png",      "cups-07.jpg"),
    ("minor_arcana_cups_8.png",      "cups-08.jpg"),
    ("minor_arcana_cups_9.png",      "cups-09.jpg"),
    ("minor_arcana_cups_10.png",     "cups-10.jpg"),
    ("minor_arcana_cups_page.png",   "cups-11.jpg"),
    ("minor_arcana_cups_knight.png", "cups-12.jpg"),
    ("minor_arcana_cups_queen.png",  "cups-13.jpg"),
    ("minor_arcana_cups_king.png",   "cups-14.jpg"),

    # ── 宝剑 (Swords) 14张 ──
    ("minor_arcana_swords_ace.png",    "swords-01.jpg"),
    ("minor_arcana_swords_2.png",      "swords-02.jpg"),
    ("minor_arcana_swords_3.png",      "swords-03.jpg"),
    ("minor_arcana_swords_4.png",      "swords-04.jpg"),
    ("minor_arcana_swords_5.png",      "swords-05.jpg"),
    ("minor_arcana_swords_6.png",      "swords-06.jpg"),
    ("minor_arcana_swords_7.png",      "swords-07.jpg"),
    ("minor_arcana_swords_8.png",      "swords-08.jpg"),
    ("minor_arcana_swords_9.png",      "swords-09.jpg"),
    ("minor_arcana_swords_10.png",     "swords-10.jpg"),
    ("minor_arcana_swords_page.png",   "swords-11.jpg"),
    ("minor_arcana_swords_knight.png", "swords-12.jpg"),
    ("minor_arcana_swords_queen.png",  "swords-13.jpg"),
    ("minor_arcana_swords_king.png",   "swords-14.jpg"),

    # ── 星币 (Pentacles) 14张 ──
    ("minor_arcana_pentacles_ace.png",    "pentacles-01.jpg"),
    ("minor_arcana_pentacles_2.png",      "pentacles-02.jpg"),
    ("minor_arcana_pentacles_3.png",      "pentacles-03.jpg"),
    ("minor_arcana_pentacles_4.png",      "pentacles-04.jpg"),
    ("minor_arcana_pentacles_5.png",      "pentacles-05.jpg"),
    ("minor_arcana_pentacles_6.png",      "pentacles-06.jpg"),
    ("minor_arcana_pentacles_7.png",      "pentacles-07.jpg"),
    ("minor_arcana_pentacles_8.png",      "pentacles-08.jpg"),
    ("minor_arcana_pentacles_9.png",      "pentacles-09.jpg"),
    ("minor_arcana_pentacles_10.png",     "pentacles-10.jpg"),
    ("minor_arcana_pentacles_page.png",   "pentacles-11.jpg"),
    ("minor_arcana_pentacles_knight.png", "pentacles-12.jpg"),
    ("minor_arcana_pentacles_queen.png",  "pentacles-13.jpg"),
    ("minor_arcana_pentacles_king.png",   "pentacles-14.jpg"),
]


def download_and_convert(src_name: str, target_name: str, session: requests.Session) -> bool:
    target_path = OUTPUT_DIR / target_name
    if target_path.exists():
        print(f"  [跳过] {target_name} 已存在")
        return True

    url = f"{BASE_URL}/{src_name}"
    try:
        resp = session.get(url, timeout=60)
        if resp.status_code != 200:
            print(f"  [失败] {src_name} HTTP {resp.status_code}")
            return False

        # PNG -> JPG 转换（白色背景，85% 质量）
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        img.save(target_path, "JPEG", quality=85, optimize=True)
        size_kb = target_path.stat().st_size // 1024
        print(f"  [OK] {src_name} -> {target_name} ({size_kb}KB)")
        return True

    except Exception as e:
        print(f"  [异常] {src_name}: {e}")
        return False


def main():
    print(f"目标目录: {OUTPUT_DIR}")
    print(f"共需下载: {len(CARD_MAP)} 张牌")
    print(f"数据来源: Internet Archive (CC0 公版)\n")

    session = requests.Session()
    session.headers.update({
        "User-Agent": "TarotTrainingApp/1.0 (educational project)"
    })

    success = 0
    failed = []

    for i, (src_name, target_name) in enumerate(CARD_MAP, 1):
        print(f"[{i:02d}/{len(CARD_MAP)}] {target_name}...")
        ok = download_and_convert(src_name, target_name, session)
        if ok:
            success += 1
        else:
            failed.append((src_name, target_name))
        time.sleep(0.2)

    print(f"\n{'='*40}")
    print(f"完成！成功: {success}/{len(CARD_MAP)}")
    if failed:
        print(f"\n失败的牌 ({len(failed)} 张):")
        for s, t in failed:
            print(f"  {s} -> {t}")
    else:
        print("所有牌下载成功！现在可以启动 App 查看效果了。")


if __name__ == "__main__":
    main()

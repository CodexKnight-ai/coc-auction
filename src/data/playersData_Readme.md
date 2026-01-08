# 📊 Scoreboard Data Generation Guide

This document explains how to generate `players.json`.

---

## 📁 Required CSV Files

You need **three CSV files**:

* `standings1.csv`
* `standings2.csv`
* `members.csv`

---

## 1️⃣ Creating `standings1.csv` and `standings2.csv`

These files contain the standings of the two qualifier contests.

### How to get the standings CSV

1.  Open the **Codeforces group contest standings page**.
2.  Select the **entire standings table**.
3.  Copy the table (Ctrl + C).
4.  Paste it into **Excel or Google Sheets**.
5.  Remove unnecessary columns and keep only:
    * `handle`
    * `rank`
    * `solved`
6.  Save the file as: `standings1.csv`
7.  Repeat the same steps for the second qualifier and save it as: `standings2.csv`

> ⚠️ **Note:** The standings may not be publicly accessible, so this step must be done manually by contest admins.

---

## 2️⃣ Creating `members.csv`

This file contains the mapping between real names and online profiles.

### How to get `members.csv`

1.  Open the **Google Form responses sheet / PClub members spreadsheet**.
2.  Copy the table containing member details.
3.  Paste it into **Excel or Google Sheets**.
4.  Keep only the following columns **exactly**:
    * `Name`
    * `cf id`
    * `codolio`
5.  Save the file as: `members.csv`

### Important Notes

* **`cf id`** can be:
    * Codeforces handle
    * Full Codeforces profile URL (`https://codeforces.com/profile/<handle>`)
* **`codolio`** can be:
    * Handle
    * `@handle`
    * Full Codolio profile link (`https://codolio.com/profile/<handle>`)

---

## 3️⃣ Generating `players.json`

1.  Place all CSV files in the same directory as the Python script:
    * `members.csv`
    * `standings1.csv`
    * `standings2.csv`
    * `getPlayersJson.py`

2.  Run the script:

```bash
python getPlayersJson.py
```

3. After successful execution, the output file will be created:

`players.json`
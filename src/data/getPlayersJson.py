import pandas as pd
import json
import re

# ---------------- CONFIG ----------------
N = 60
STANDINGS_1 = "standings1.csv"
STANDINGS_2 = "standings2.csv"
MEMBERS_FILE = "members.csv"
OUTPUT_JSON = "players_final.json"

# ---------------- HELPERS ----------------
def normalize_cf_handle(value):
    if pd.isna(value):
        return None
    value = str(value).strip()
    match = re.search(r"codeforces\.com/profile/([^/?#]+)", value, re.I)
    if match:
        return match.group(1).lower()
    return value.lower()

def normalize_codolio(value):
    if pd.isna(value):
        return "NA"
    value = str(value).strip()
    match = re.search(r"codolio\.com/profile/([^/?#]+)", value, re.I)
    if match:
        handle = match.group(1)
    else:
        handle = value.lstrip("@")
    handle = handle.strip().lower()
    if not handle:
        return "NA"
    return f"https://codolio.com/profile/{handle}"

def process_standings(path):
    df = pd.read_csv(path)

    df["cf_handle"] = df["Handle"].apply(normalize_cf_handle)

    df = df.rename(columns={
        "Place": "rank",
        "Solved": "problems_solved"
    })

    # Deduplicate: keep best rank
    df = (
        df.sort_values("rank")
        .drop_duplicates(subset="cf_handle", keep="first")
    )

    max_solved = df["problems_solved"].max()

    df["score"] = (
        200 * (N - df["rank"] + 1) * df["problems_solved"]
        / (N * max_solved)
    ).round(0).astype(int)

    return df[["cf_handle", "score"]]

# ---------------- PROCESS STANDINGS ----------------
df_q1 = process_standings(STANDINGS_1).rename(columns={"score": "q1_score"})
df_q2 = process_standings(STANDINGS_2).rename(columns={"score": "q2_score"})

# Combine both contests
df_scores = pd.merge(df_q1, df_q2, on="cf_handle", how="outer").fillna(0)
df_scores["q1_score"] = df_scores["q1_score"].astype(int)
df_scores["q2_score"] = df_scores["q2_score"].astype(int)

# Best score = max of both
df_scores["best_score"] = df_scores[["q1_score", "q2_score"]].max(axis=1)

# ---------------- MEMBERS ----------------
df_mem = pd.read_csv(MEMBERS_FILE)

df_mem["cf_handle"] = df_mem["cf id"].apply(normalize_cf_handle)
df_mem["codolio_link"] = df_mem["codolio"].apply(normalize_codolio)

df_mem = df_mem.rename(columns={"Name": "name"})
df_mem = df_mem.drop_duplicates(subset="cf_handle", keep="first")

# ---------------- MERGE ALL ----------------
df = pd.merge(df_scores, df_mem, on="cf_handle", how="left")

# ---------------- FINAL RANKING ----------------
df = (
    df.sort_values(
        ["best_score", "q1_score", "q2_score"],
        ascending=[False, False, False]
    )
    .head(60)
    .reset_index(drop=True)
)

# ---------------- POSITION ----------------
def get_position(rank):
    if rank <= 12:
        return "Co-Leader"
    elif rank <= 28:
        return "Elder"
    elif rank <= 60:
        return "Member"
    return "NA"

# ---------------- BUILD JSON ----------------
players = []

for idx, row in df.iterrows():
    final_rank = idx + 1
    players.append({
        "id": str(final_rank),              # serial ID
        "cf_id": row["cf_handle"],           # ✅ INCLUDED
        "position": get_position(final_rank),
        "name": row["name"] if pd.notna(row["name"]) else "NA",
        "best_score": str(row["best_score"]),
        "q1_score": str(row["q1_score"]),
        "q2_score": str(row["q2_score"]),
        "codolio_link": row["codolio_link"] if pd.notna(row["codolio_link"]) else "NA",
        "price": 0,
        "sold": False,
        "team": None,
        "modifiedTime": 0
    })

final_json = {"players": players}

# ---------------- SAVE ----------------
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(final_json, f, indent=4)

print("✅ JSON generated successfully →", OUTPUT_JSON)

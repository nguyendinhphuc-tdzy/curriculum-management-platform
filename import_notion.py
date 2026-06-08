import os
import sys
import json
import urllib.request
from pathlib import Path

# Try to load using python-dotenv, fallback to manual parsing if missing
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()


NOTION_TOKEN = os.getenv("NOTION_TOKEN")
# Extract page ID from: https://app.notion.com/p/Yapsu-Hybrid-Two-Language-Demo-3796d0671d6181f9a886c96b765b72c6
PAGE_ID = "3796d0671d6181f9a886c96b765b72c6"

if not NOTION_TOKEN:
    print("Error: NOTION_TOKEN is missing in the .env file.")
    print("Please follow the setup guide to generate a Notion integration token.")
    sys.exit(1)

def fetch_notion_page(block_id):
    print(f"Fetching blocks for ID: {block_id} ...")
    url = f"https://api.notion.com/v1/blocks/{block_id}/children?page_size=100"
    
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {NOTION_TOKEN}")
    req.add_header("Notion-Version", "2022-06-28")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data.get("results", [])
    except Exception as e:
        print(f"Error calling Notion API: {e}")
        return []

def parse_blocks(blocks):
    parsed_items = []
    for block in blocks:
        block_type = block.get("type")
        block_content = block.get(block_type, {})
        
        # Extract rich text if present
        rich_texts = block_content.get("rich_text", [])
        text_content = "".join([t.get("plain_text", "") for t in rich_texts])
        
        if block_type == "child_database":
            title = block_content.get("title", "Database")
            print(f"\n[FOUND DATABASE]: {title} (ID: {block['id']})")
            parsed_items.append({"type": "database", "id": block["id"], "title": title})
            
        elif text_content:
            parsed_items.append({"type": block_type, "text": text_content})
            print(f"[{block_type.upper()}]: {text_content}")
            
    return parsed_items

def main():
    print("Initializing Notion API extraction...")
    blocks = fetch_notion_page(PAGE_ID)
    if not blocks:
        print("\nNo blocks returned. Make sure:")
        print("1. Your NOTION_TOKEN in .env is correct.")
        print("2. You have shared the page with your Notion Integration (Add Connection).")
        return
        
    items = parse_blocks(blocks)
    
    # Check if there are databases to drill down
    for item in items:
        if item["type"] == "database":
            # Fetch database schema/items
            print(f"\nDrilling down into Database: {item['title']}...")
            # Querying database rows
            url = f"https://api.notion.com/v1/databases/{item['id']}/query"
            req = urllib.request.Request(url, method="POST")
            req.add_header("Authorization", f"Bearer {NOTION_TOKEN}")
            req.add_header("Notion-Version", "2022-06-28")
            req.add_header("Content-Type", "application/json")
            
            try:
                with urllib.request.urlopen(req) as response:
                    db_data = json.loads(response.read().decode('utf-8'))
                    rows = db_data.get("results", [])
                    print(f"Found {len(rows)} rows in database:")
                    for idx, row in enumerate(rows[:5], 1): # show first 5
                        props = row.get("properties", {})
                        # Find name/title property
                        title_prop = next((p for p in props.values() if p.get("type") == "title"), None)
                        title_text = ""
                        if title_prop:
                            title_text = "".join([t.get("plain_text", "") for t in title_prop.get("title", [])])
                        print(f"  Row {idx}: {title_text}")
            except Exception as e:
                print(f"  Could not query database rows: {e}")

if __name__ == "__main__":
    main()

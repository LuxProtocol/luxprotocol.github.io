import os, json, datetime
 
FOLDERS = ['documents', 'presentations']
 
for folder in FOLDERS:
    if not os.path.isdir(folder):
        print(f"Skipping '{folder}' — folder not found")
        continue
 
    files = []
    for f in sorted(os.listdir(folder)):
        if f == 'index.json' or f.startswith('.'):
            continue
        path = os.path.join(folder, f)
        if not os.path.isfile(path):
            continue
 
        size = os.path.getsize(path)
        if size < 1024:
            size_str = f"{size} B"
        elif size < 1024 * 1024:
            size_str = f"{size / 1024:.1f} KB"
        else:
            size_str = f"{size / (1024 * 1024):.1f} MB"
 
        modified = os.path.getmtime(path)
        date_str = datetime.datetime.fromtimestamp(modified).strftime('%b %d, %Y')
 
        files.append({"name": f, "size": size_str, "date": date_str})
        print(f"  {folder}/{f}  {size_str}  {date_str}")
 
    out_path = os.path.join(folder, 'index.json')
    with open(out_path, 'w') as out:
        json.dump(files, out, indent=2)
    print(f"Written {out_path} ({len(files)} entries)\n")

import os
import zipfile

def make_project_zip():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    public_dir = os.path.join(base_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    zip_path = os.path.join(public_dir, "shoplix-ecommerce-source-code.zip")

    ignore_patterns = {
        "node_modules",
        ".git",
        ".cache",
        "__pycache__",
        "shoplix-ecommerce-source-code.zip",
    }

    include_extensions = {
        ".ts", ".tsx", ".js", ".jsx", ".json", ".html", ".css", ".md",
        ".example", ".rules", ".svg", ".png", ".jpg", ".jpeg", ".ico",
        ".bat", ".sh", ".txt"
    }

    include_filenames = {
        ".gitignore", ".env.example", "package.json", "tsconfig.json",
        "vite.config.ts", "index.html", "metadata.json", "firestore.rules",
        "firebase-applet-config.json", "firebase-blueprint.json", "README.md",
        "README_BANGLA.md", "নির্দেশনা_README_BANGLA.html",
        "RUN_PROJECT_WINDOWS.bat", "RUN_PROJECT_MAC_LINUX.sh"
    }

    files_added = 0
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in ignore_patterns and not d.startswith(".")]

            for file in files:
                if file in ignore_patterns or file.endswith(".zip") or file.endswith(".pyc"):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)

                # Skip files inside public that are zip or temporary
                if rel_path.startswith("public/") and file.endswith(".zip"):
                    continue

                ext = os.path.splitext(file)[1].lower()
                if ext in include_extensions or file in include_filenames:
                    zf.write(full_path, arcname=rel_path)
                    files_added += 1

    file_size_kb = round(os.path.getsize(zip_path) / 1024, 1)
    print(f"SUCCESS: Created {zip_path} with {files_added} files ({file_size_kb} KB)")

    # Also copy to dist if dist exists so Vite serves it in both dev and preview
    dist_dir = os.path.join(base_dir, "dist")
    if os.path.exists(dist_dir):
        import shutil
        dist_zip = os.path.join(dist_dir, "shoplix-ecommerce-source-code.zip")
        shutil.copy2(zip_path, dist_zip)
        print(f"SUCCESS: Synced zip to dist: {dist_zip}")

if __name__ == "__main__":
    make_project_zip()

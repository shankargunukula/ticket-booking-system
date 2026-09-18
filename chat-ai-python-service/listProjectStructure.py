from pathlib import Path

def generate_ascii_tree(dir_path, prefix=""):
    root = Path(dir_path)

    # Configuration: Files/folders to skip
    ignored_names = {'target', 'venv', '.git', '.idea'}
    ignored_extensions = {'.class', '.pyc'}

    # Gather and filter contents of the current directory
    paths = []
    for p in root.iterdir():
        if p.name in ignored_names:
            continue
        if p.is_file() and p.suffix in ignored_extensions:
            continue
        paths.append(p)

    # Sort directories first, then files alphabetically
    paths.sort(key=lambda p: (not p.is_dir(), p.name.lower()))

    # Process each item and draw branches
    count = len(paths)
    for i, path in enumerate(paths):
        is_last = (i == count - 1)

        # Select the branch character based on position
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{path.name}")

        # If it's a directory, step inside it recursively
        if path.is_dir():
            extension_prefix = "    " if is_last else "│   "
            generate_ascii_tree(path, prefix + extension_prefix)

# Execute the script on your project directory
project_dir = r"D:\AI\ticket-booking-system\movie-rag-service"
print(Path(project_dir).name)  # Print the root folder name
generate_ascii_tree(project_dir)

import os

def refactor_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        replacements = [
            ('Hospitals', 'Organizations'),
            ('hospitals', 'organizations'),
            ('Hospital', 'Organization'),
            ('hospital', 'organization'),
            ('HOSPITAL', 'ORGANIZATION'),
            ('Tenders', 'Projects'),
            ('tenders', 'projects'),
            ('Tender', 'Project'),
            ('tender', 'project'),
            ('TENDER', 'PROJECT')
        ]

        new_content = content
        for old, new in replacements:
            new_content = new_content.replace(old, new)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Modified: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def walk_and_refactor(base_dir):
    for root, dirs, files in os.walk(base_dir, topdown=False):
        # Skip node_modules, venv, etc.
        if any(skip in root for skip in ['node_modules', 'dist', '.git', '.angular', 'venv', '__pycache__', '.pytest_cache']):
            continue

        # Refactor file contents
        for file in files:
            if file.endswith(('.py', '.ts', '.html', '.scss', '.json', '.md', '.txt')):
                if file in ['refactor.py', 'package-lock.json']:
                    continue
                filepath = os.path.join(root, file)
                refactor_file(filepath)
                
        # Rename files
        for file in files:
            new_file = file
            replacements = [
                ('hospitals', 'organizations'),
                ('hospital', 'organization'),
                ('tenders', 'projects'),
                ('tender', 'project')
            ]
            for old, new in replacements:
                new_file = new_file.replace(old, new)
            
            if new_file != file:
                old_path = os.path.join(root, file)
                new_path = os.path.join(root, new_file)
                try:
                    os.rename(old_path, new_path)
                    print(f"Renamed file: {old_path} -> {new_path}")
                except Exception as e:
                    print(f"Failed to rename {old_path}: {e}")

        # Rename directories
        for d in dirs:
            if d in ['node_modules', 'dist', '.git', '.angular', 'venv', '__pycache__', '.pytest_cache']:
                continue
            
            new_d = d
            replacements = [
                ('hospitals', 'organizations'),
                ('hospital', 'organization'),
                ('tenders', 'projects'),
                ('tender', 'project')
            ]
            for old, new in replacements:
                new_d = new_d.replace(old, new)
                
            if new_d != d:
                old_path = os.path.join(root, d)
                new_path = os.path.join(root, new_d)
                try:
                    os.rename(old_path, new_path)
                    print(f"Renamed dir: {old_path} -> {new_path}")
                except Exception as e:
                    print(f"Failed to rename directory {old_path}: {e}")

if __name__ == '__main__':
    base_dir = r"c:\Users\Vaibhav Palve\Desktop\Health Care"
    walk_and_refactor(base_dir)

#!/usr/bin/env python3
"""
Script to add useTranslation import to merchant pages
"""
import re
import os

pages_dir = "/home/ubuntu/sari/client/src/pages/merchant"
target_files = ["Dashboard.tsx", "Products.tsx", "Orders.tsx", "Conversations.tsx", "Campaigns.tsx"]

def add_use_translation(file_path):
    """Add useTranslation import if not exists"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has useTranslation
    if 'useTranslation' in content:
        print(f"✓ {os.path.basename(file_path)} already has useTranslation")
        return False
    
    # Find the import section and add useTranslation
    import_pattern = r"(import.*?from ['\"]react['\"];)"
    
    if re.search(import_pattern, content):
        # Add after react import
        new_content = re.sub(
            import_pattern,
            r"\1\nimport { useTranslation } from 'react-i18next';",
            content,
            count=1
        )
    else:
        # Add at the beginning after the first import
        first_import = re.search(r"^import.*?;", content, re.MULTILINE)
        if first_import:
            pos = first_import.end()
            new_content = content[:pos] + "\nimport { useTranslation } from 'react-i18next';" + content[pos:]
        else:
            print(f"✗ Could not find import section in {os.path.basename(file_path)}")
            return False
    
    # Add const { t } = useTranslation(); after function declaration
    func_pattern = r"(export default function \w+\([^)]*\) \{)"
    if re.search(func_pattern, new_content):
        new_content = re.sub(
            func_pattern,
            r"\1\n  const { t } = useTranslation();",
            new_content,
            count=1
        )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added useTranslation to {os.path.basename(file_path)}")
    return True

def main():
    print("Adding useTranslation to merchant pages...")
    print("=" * 50)
    
    for filename in target_files:
        file_path = os.path.join(pages_dir, filename)
        if os.path.exists(file_path):
            add_use_translation(file_path)
        else:
            print(f"✗ File not found: {filename}")
    
    print("=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()

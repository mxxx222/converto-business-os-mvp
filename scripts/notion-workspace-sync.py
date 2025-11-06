#!/usr/bin/env python3
"""
Notion Workspace Sync - Complete File-to-Database Sync
Scans all files → Converts to Notion database entries
Auto-categorizes by type, priority, dependencies
Links related content across projects
Tracks changes in real-time
"""

import os
import json
import hashlib
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import re

# File type categories
FILE_CATEGORIES = {
    'documentation': ['.md', '.txt', '.rst'],
    'frontend': ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'],
    'backend': ['.py', '.go', '.rs', '.java'],
    'config': ['.json', '.yaml', '.yml', '.toml', '.ini', '.env'],
    'test': ['test_', '_test.', 'spec.', '.test.'],
    'database': ['.sql', '.db', '.migration'],
    'deployment': ['.dockerfile', 'docker-compose', '.github', 'vercel.json', 'render.yaml'],
    'script': ['.sh', '.ps1', '.bat'],
    'static': ['.png', '.jpg', '.svg', '.ico', '.webp'],
}

# Priority mapping based on file patterns
PRIORITY_PATTERNS = {
    'critical': ['config', 'env', 'package.json', 'requirements.txt', 'dockerfile', 'main.py', 'app.py', 'index.tsx', 'page.tsx', 'layout.tsx'],
    'high': ['api', 'route', 'service', 'middleware', 'utils', 'lib', 'core'],
    'medium': ['component', 'page', 'layout', 'hook', 'type'],
    'low': ['test', 'spec', 'example', 'demo', 'docs'],
}

# Dependency extraction patterns
DEPENDENCY_PATTERNS = {
    'import': r'import\s+(?:.+\s+from\s+)?[\'"]([^\'"]+)[\'"]',
    'require': r'require\([\'"]([^\'"]+)[\'"]\)',
    'from': r'from\s+[\'"]([^\'"]+)[\'"]',
    'include': r'#include\s+<([^>]+)>',
    'link': r'\[([^\]]+)\]\(([^\)]+)\)',  # Markdown links
}

@dataclass
class FileMetadata:
    """Metadata for a file"""
    path: str
    name: str
    extension: str
    category: str
    priority: str
    size: int
    last_modified: str
    content_hash: str
    dependencies: List[str]
    related_files: List[str]
    lines_of_code: int = 0
    description: str = ""


class NotionWorkspaceSync:
    """Complete workspace sync to Notion"""
    
    def __init__(self, notion_token: str, workspace_page_id: str):
        self.notion_token = notion_token
        self.workspace_page_id = workspace_page_id
        self.api_base = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {notion_token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.file_db_id = None
        self.dependency_db_id = None
        self.file_cache = {}
        
    def scan_workspace(self, root_dir: str = ".") -> List[FileMetadata]:
        """Scan all files in workspace"""
        print(f"🔍 Scanning workspace: {root_dir}")
        files = []
        exclude_dirs = {'.git', 'node_modules', '.next', '__pycache__', '.venv', 'venv', 'dist', 'build'}
        
        for root, dirs, filenames in os.walk(root_dir):
            # Remove excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for filename in filenames:
                filepath = os.path.join(root, filename)
                rel_path = os.path.relpath(filepath, root_dir)
                
                try:
                    metadata = self._extract_metadata(filepath, rel_path)
                    if metadata:
                        files.append(metadata)
                        self.file_cache[rel_path] = metadata
                except Exception as e:
                    print(f"⚠️  Error processing {rel_path}: {e}")
        
        print(f"✅ Scanned {len(files)} files")
        return files
    
    def _extract_metadata(self, filepath: str, rel_path: str) -> Optional[FileMetadata]:
        """Extract metadata from a file"""
        try:
            stat = os.stat(filepath)
            name = os.path.basename(filepath)
            ext = os.path.splitext(name)[1].lower()
            
            # Determine category
            category = self._categorize_file(name, ext, rel_path)
            
            # Determine priority
            priority = self._determine_priority(name, rel_path)
            
            # Read file for content analysis
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    content_hash = hashlib.md5(content.encode()).hexdigest()
                    lines_of_code = len([l for l in content.split('\n') if l.strip() and not l.strip().startswith('#') and not l.strip().startswith('//')])
                    
                    # Extract dependencies
                    dependencies = self._extract_dependencies(content, ext)
                    
                    # Extract description from comments/docstrings
                    description = self._extract_description(content, ext)
            except:
                content_hash = ""
                lines_of_code = 0
                dependencies = []
                description = ""
            
            return FileMetadata(
                path=rel_path,
                name=name,
                extension=ext,
                category=category,
                priority=priority,
                size=stat.st_size,
                last_modified=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                content_hash=content_hash,
                dependencies=dependencies,
                related_files=[],
                lines_of_code=lines_of_code,
                description=description[:500]  # Limit description length
            )
        except Exception as e:
            print(f"Error extracting metadata from {filepath}: {e}")
            return None
    
    def _categorize_file(self, name: str, ext: str, path: str) -> str:
        """Categorize file based on extension and path"""
        # Check extension
        for category, extensions in FILE_CATEGORIES.items():
            if ext in extensions:
                return category
        
        # Check path patterns
        path_lower = path.lower()
        if 'frontend' in path_lower or 'app' in path_lower:
            return 'frontend'
        elif 'backend' in path_lower or 'api' in path_lower:
            return 'backend'
        elif 'test' in path_lower:
            return 'test'
        elif 'config' in path_lower or 'deployment' in path_lower:
            return 'config'
        
        return 'other'
    
    def _determine_priority(self, name: str, path: str) -> str:
        """Determine file priority"""
        name_lower = name.lower()
        path_lower = path.lower()
        
        for priority, patterns in PRIORITY_PATTERNS.items():
            for pattern in patterns:
                if pattern in name_lower or pattern in path_lower:
                    return priority
        
        return 'medium'
    
    def _extract_dependencies(self, content: str, ext: str) -> List[str]:
        """Extract dependencies from file content"""
        dependencies = set()
        
        if ext in ['.ts', '.tsx', '.js', '.jsx']:
            # JavaScript/TypeScript imports
            for pattern in ['import', 'from', 'require']:
                matches = re.findall(DEPENDENCY_PATTERNS[pattern], content)
                dependencies.update(matches)
        elif ext == '.py':
            # Python imports
            matches = re.findall(r'^(?:import|from)\s+([^\s]+)', content, re.MULTILINE)
            dependencies.update(matches)
        elif ext == '.md':
            # Markdown links
            matches = re.findall(DEPENDENCY_PATTERNS['link'], content)
            dependencies.update([link for _, link in matches if not link.startswith('http')])
        
        # Filter out external dependencies
        local_deps = [d for d in dependencies if not d.startswith(('http', 'node:', '@types')) and '/' in d]
        return list(local_deps)[:20]  # Limit to 20 dependencies
    
    def _extract_description(self, content: str, ext: str) -> str:
        """Extract description from file comments/docstrings"""
        if ext in ['.py']:
            # Python docstring
            match = re.search(r'"""(.*?)"""', content, re.DOTALL)
            if match:
                return match.group(1).strip()[:200]
        elif ext in ['.ts', '.tsx', '.js', '.jsx']:
            # JSDoc comment
            match = re.search(r'/\*\*\s*(.*?)\*/', content, re.DOTALL)
            if match:
                return match.group(1).strip()[:200]
        
        # First comment line
        for line in content.split('\n')[:10]:
            line = line.strip()
            if line.startswith('//') or line.startswith('#'):
                desc = line.lstrip('#/').strip()
                if desc and not desc.startswith('!'):
                    return desc[:200]
        
        return ""
    
    def _find_related_files(self, files: List[FileMetadata]) -> None:
        """Link related files based on dependencies"""
        print("🔗 Linking related files...")
        
        for file in files:
            related = []
            for dep in file.dependencies:
                # Find files that match dependency path
                for other_file in files:
                    if dep in other_file.path or other_file.name in dep:
                        if other_file.path != file.path:
                            related.append(other_file.path)
            
            file.related_files = list(set(related))[:10]  # Limit to 10 related files
    
    def create_databases(self) -> Tuple[str, str]:
        """Create Notion databases for files and dependencies"""
        print("📊 Creating Notion databases...")
        
        # File Database Schema
        file_db_schema = {
            "parent": {"page_id": self.workspace_page_id},
            "title": [{"text": {"content": "Workspace Files"}}],
            "properties": {
                "Name": {"title": {}},
                "Path": {"rich_text": {}},
                "Category": {"select": {
                    "options": [
                        {"name": cat, "color": self._get_category_color(cat)}
                        for cat in FILE_CATEGORIES.keys()
                    ]
                }},
                "Priority": {"select": {
                    "options": [
                        {"name": "critical", "color": "red"},
                        {"name": "high", "color": "orange"},
                        {"name": "medium", "color": "yellow"},
                        {"name": "low", "color": "gray"}
                    ]
                }},
                "Size": {"number": {}},
                "Lines of Code": {"number": {}},
                "Last Modified": {"date": {}},
                "Dependencies": {"relation": {"database_id": "TEMP"}},  # Will update after creation
                "Related Files": {"relation": {"database_id": "TEMP"}},
                "Description": {"rich_text": {}},
                "Content Hash": {"rich_text": {}},
            }
        }
        
        # Create file database
        import requests
        response = requests.post(
            f"{self.api_base}/databases",
            headers=self.headers,
            json=file_db_schema
        )
        
        if response.status_code == 200:
            self.file_db_id = response.json()["id"]
            print(f"✅ Created Files database: {self.file_db_id}")
        else:
            print(f"❌ Error creating database: {response.text}")
            return None, None
        
        # Update relations to self-reference
        update_schema = {
            "properties": {
                "Dependencies": {"relation": {"database_id": self.file_db_id}},
                "Related Files": {"relation": {"database_id": self.file_db_id}},
            }
        }
        
        requests.patch(
            f"{self.api_base}/databases/{self.file_db_id}",
            headers=self.headers,
            json=update_schema
        )
        
        return self.file_db_id, self.file_db_id
    
    def _get_category_color(self, category: str) -> str:
        """Get color for category"""
        colors = {
            'documentation': 'blue',
            'frontend': 'green',
            'backend': 'purple',
            'config': 'yellow',
            'test': 'orange',
            'database': 'red',
            'deployment': 'pink',
            'script': 'brown',
            'static': 'gray',
            'other': 'default',
        }
        return colors.get(category, 'default')
    
    def sync_files_to_notion(self, files: List[FileMetadata]) -> Dict[str, str]:
        """Sync files to Notion database"""
        print(f"📤 Syncing {len(files)} files to Notion...")
        
        if not self.file_db_id:
            self.file_db_id, _ = self.create_databases()
        
        file_id_map = {}  # Map file paths to Notion page IDs
        
        # First pass: Create all pages
        for file in files:
            try:
                page_id = self._create_file_page(file)
                if page_id:
                    file_id_map[file.path] = page_id
            except Exception as e:
                print(f"⚠️  Error creating page for {file.path}: {e}")
        
        # Second pass: Link related files
        print("🔗 Linking related files...")
        for file in files:
            if file.path in file_id_map:
                self._update_file_relations(file_id_map[file.path], file, file_id_map)
        
        print(f"✅ Synced {len(file_id_map)} files to Notion")
        return file_id_map
    
    def _create_file_page(self, file: FileMetadata) -> Optional[str]:
        """Create a Notion page for a file"""
        import requests
        
        properties = {
            "Name": {"title": [{"text": {"content": file.name}}]},
            "Path": {"rich_text": [{"text": {"content": file.path}}]},
            "Category": {"select": {"name": file.category}},
            "Priority": {"select": {"name": file.priority}},
            "Size": {"number": file.size},
            "Lines of Code": {"number": file.lines_of_code},
            "Last Modified": {"date": {"start": file.last_modified}},
            "Description": {"rich_text": [{"text": {"content": file.description}}]},
            "Content Hash": {"rich_text": [{"text": {"content": file.content_hash}}]},
        }
        
        # Add children with code preview
        children = []
        if file.description:
            children.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": file.description}}]
                }
            })
        
        page_data = {
            "parent": {"database_id": self.file_db_id},
            "properties": properties,
            "children": children
        }
        
        response = requests.post(
            f"{self.api_base}/pages",
            headers=self.headers,
            json=page_data
        )
        
        if response.status_code == 200:
            return response.json()["id"]
        else:
            print(f"Error creating page: {response.text}")
            return None
    
    def _update_file_relations(self, page_id: str, file: FileMetadata, file_id_map: Dict[str, str]) -> None:
        """Update file relations in Notion"""
        import requests
        
        related_ids = [file_id_map[rel] for rel in file.related_files if rel in file_id_map]
        
        if related_ids:
            properties = {
                "Related Files": {
                    "relation": [{"id": rid} for rid in related_ids[:10]]
                }
            }
            
            requests.patch(
                f"{self.api_base}/pages/{page_id}",
                headers=self.headers,
                json={"properties": properties}
            )
    
    def track_changes(self, files: List[FileMetadata], previous_hash_file: str = ".notion-sync-hash.json") -> List[FileMetadata]:
        """Track changes since last sync"""
        print("🔄 Tracking changes...")
        
        if os.path.exists(previous_hash_file):
            with open(previous_hash_file, 'r') as f:
                previous_hashes = json.load(f)
        else:
            previous_hashes = {}
        
        changed_files = []
        for file in files:
            if file.path not in previous_hashes or previous_hashes[file.path] != file.content_hash:
                changed_files.append(file)
        
        # Save current hashes
        current_hashes = {f.path: f.content_hash for f in files}
        with open(previous_hash_file, 'w') as f:
            json.dump(current_hashes, f, indent=2)
        
        print(f"✅ Found {len(changed_files)} changed files")
        return changed_files


def main():
    """Main sync process"""
    import sys
    
    # Get environment variables
    notion_token = os.getenv("NOTION_TOKEN") or os.getenv("NOTION_API_KEY")
    workspace_page_id = os.getenv("NOTION_WORKSPACE_PAGE_ID")
    
    if not notion_token:
        print("❌ Error: NOTION_TOKEN or NOTION_API_KEY environment variable required")
        sys.exit(1)
    
    if not workspace_page_id:
        print("❌ Error: NOTION_WORKSPACE_PAGE_ID environment variable required")
        print("💡 Create a page in Notion and use its ID as the workspace page")
        sys.exit(1)
    
    # Initialize sync
    sync = NotionWorkspaceSync(notion_token, workspace_page_id)
    
    # Scan workspace
    files = sync.scan_workspace(".")
    
    # Link related files
    sync._find_related_files(files)
    
    # Track changes
    changed_files = sync.track_changes(files)
    
    # Sync to Notion
    if changed_files:
        print(f"📤 Syncing {len(changed_files)} changed files...")
        file_id_map = sync.sync_files_to_notion(changed_files)
    else:
        print("✅ No changes detected, skipping sync")
        # Still sync if databases don't exist
        if not sync.file_db_id:
            sync.create_databases()
            sync.sync_files_to_notion(files)
    
    print("✅ Workspace sync complete!")


if __name__ == "__main__":
    main()



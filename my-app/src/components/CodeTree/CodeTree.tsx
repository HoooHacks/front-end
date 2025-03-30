import React, { useState, useCallback, memo } from 'react';
import { useQuery } from 'react-query';
import './CodeTree.css';
import { useTheme } from '../../contexts/ThemeContext';

export interface TreeNode {
  name: string;
  path: string;
  children: (TreeNode | null)[] | null;
  file: boolean;
}

interface CodeTreeProps {
  onFileSelect: (filePath: string) => void;
  githubToken: string;
  githubRepo: string;
  fileTree?: string; // optional: if provided from TutorialPage, use it instead of fetching
}

function fetchCodeTree(githubToken: string, githubRepo: string): Promise<TreeNode> {
  const branchName = 'main';
  const baseUrl = 'http://localhost:8080/github/analyze';
  const url = new URL(baseUrl);
  url.searchParams.append('url', githubRepo);
  url.searchParams.append('branch', branchName);
  url.searchParams.append('token', githubToken);

  return fetch(url.toString(), { method: 'POST' })
    .then((res) => {
      if (!res.ok) {
        return res.text().then(text => {
          console.error('Backend error:', text);
          throw new Error('Network response was not ok');
        });
      }
      return res.json();
    })
    .then((data) => {
      // Parse the fileTree JSON string returned by the backend.
      const fileTreeJson: TreeNode = JSON.parse(data.fileTree);
      return fileTreeJson;
    });
}

interface CodeTreeNodeProps {
  node: TreeNode;
  onFileSelect: (filePath: string) => void;
}

const CodeTreeNode: React.FC<CodeTreeNodeProps> = memo(({ node, onFileSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const validChildren = node.children ? (node.children.filter(child => child !== null) as TreeNode[]) : [];

  const handleToggle = useCallback(() => setExpanded(prev => !prev), []);
  const handleFileClick = useCallback(() => {
    if (node.file) onFileSelect(node.path);
  }, [node, onFileSelect]);

  return (
    <div className="tree-node">
      <div className={node.file ? 'file-node' : 'folder-node'}>
        {!node.file && (
          <span className="toggle-icon" onClick={handleToggle}>
            {expanded ? '▼' : '►'}
          </span>
        )}
        <span onClick={node.file ? handleFileClick : handleToggle}>
          {node.name}
        </span>
      </div>
      {expanded && !node.file && validChildren.length > 0 && (
        <div className="tree-children">
          {validChildren.map((child, idx) => (
            <CodeTreeNode key={child?.path || idx} node={child} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
});

const CodeTree: React.FC<CodeTreeProps> = ({ onFileSelect, githubToken, githubRepo, fileTree }) => {
  const { isDarkMode } = useTheme();
  const { data, isLoading, error } = useQuery<TreeNode>(
    ['codeTree', githubToken, githubRepo],
    () => {
      if (fileTree) {
        return Promise.resolve(JSON.parse(fileTree) as TreeNode);
      }
      return fetchCodeTree(githubToken, githubRepo);
    },
    { enabled: !!githubToken && !!githubRepo, staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 }
  );

  if (isLoading) return <div className="code-tree-container">Loading code tree...</div>;
  if (error) return <div className="code-tree-container">Error loading code tree: {(error as Error).message}</div>;

  return (
    <div className={`code-tree-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="code-tree-header">
        <h3>Project Explorer</h3>
      </div>
      {data && (
        <div className="tree-container">
          <CodeTreeNode node={data} onFileSelect={onFileSelect} />
        </div>
      )}
    </div>
  );
};

export default CodeTree;

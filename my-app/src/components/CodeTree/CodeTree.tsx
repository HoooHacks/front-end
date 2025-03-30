import React, { useState } from 'react';
import './CodeTree.css';

export interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  file: boolean;
}

interface CodeTreeProps {
  onFileSelect: (filePath: string) => void;
}

const mockFileTree: TreeNode = {
  name: 'src',
  path: 'src',
  file: false,
  children: [
    {
      name: 'App.tsx',
      path: 'src/App.tsx',
      file: true,
    },
    {
      name: 'components',
      path: 'src/components',
      file: false,
      children: [
        {
          name: 'Header.tsx',
          path: 'src/components/Header.tsx',
          file: true,
        },
      ],
    },
    {
      name: 'pages',
      path: 'src/pages',
      file: false,
      children: [
        {
          name: 'Landing.tsx',
          path: 'src/pages/Landing.tsx',
          file: true,
        },
      ],
    },
  ],
};

const TreeNodeComponent: React.FC<{ node: TreeNode; onFileSelect: (path: string) => void }> = ({
  node,
  onFileSelect,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = () => setExpanded(!expanded);
  const handleClick = () => {
    if (node.file) onFileSelect(node.path);
    else toggleExpand();
  };

  return (
    <div className="tree-node">
      <div className={node.file ? 'file-node' : 'folder-node'} onClick={handleClick}>
        {!node.file && <span className="toggle-icon">{expanded ? '▼' : '►'}</span>}
        {node.name}
      </div>
      {expanded && hasChildren && (
        <div className="tree-children">
          {node.children!.map((child) => (
            <TreeNodeComponent key={child.path} node={child} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const CodeTree: React.FC<CodeTreeProps> = ({ onFileSelect }) => {
  return (
    <div className="code-tree-container">
      <div className="code-tree-header">
        <h3>Project Explorer</h3>
      </div>
      <div className="tree-container">
        <TreeNodeComponent node={mockFileTree} onFileSelect={onFileSelect} />
      </div>
    </div>
  );
};

export default CodeTree;
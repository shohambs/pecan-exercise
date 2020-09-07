import React, { useState, useEffect } from 'react';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { get } from 'lodash';

import './tree-node.scss';
import dataFetch from '../../data-fetch.hook';

interface TreeNodeProps {
  node: TreeNode;
  parentPath: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, parentPath }) => {
  const { name } = node;
  const [leaves, setLeaves] = useState(node.leaves);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLeaves, setHasLeaves] = useState(true);
  const currentPath = parentPath !== '' ? `${parentPath}.${name}` : name;
  const [uiLeaves, setUILeaves] = useState<JSX.Element | null>(null);
  const [error, setError] = useState('');

  function getLeaves() {
    try {
      dataFetch(currentPath, currentPath === 'root')
        .then((tree) => {
          const path: string = currentPath.split('.').join('.leaves.');
          const currentNode = get({ root: tree }, path);
          setLeaves(currentNode.leaves);
          if (Object.keys(currentNode.leaves).length > 0) {
            setHasLeaves(true);
          } else {
            setHasLeaves(false);
          }
        })
        .catch((err: Error) => {
          setError(err.message);
          setTimeout(() => setError(''), 5000);
        });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  }

  function handleClick() {
    if (!hasLeaves) {
      return;
    }
    if (!isOpen && (!leaves || Object.keys(leaves).length === 0)) {
      getLeaves();
    }
    setIsOpen(!isOpen);
  }

  useEffect(() => {
    if (leaves && Object.keys(leaves).length > 0) {
      setUILeaves(
        <div className="leaves">
          {Object.keys(leaves).map((leafName) => {
            return <TreeNode key={leafName} node={leaves[leafName]} parentPath={currentPath} />;
          })}
        </div>
      );
    }
  }, [leaves]);

  return (
    <div className="tree-node">
      <Button size="small" disableRipple className="node-label" onClick={handleClick}>
        {hasLeaves &&
          (isOpen ? (
            <KeyboardArrowDown fontSize="small" />
          ) : (
            <KeyboardArrowRight fontSize="small" />
          ))}
        <span>{name}</span>
      </Button>
      {hasLeaves && isOpen && uiLeaves !== null && uiLeaves}
      <Snackbar open={error !== ''}>
        <span className="error-text">{error}</span>
      </Snackbar>
    </div>
  );
};

export default TreeNode;

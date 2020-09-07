import React from 'react';

import './App.scss';
import TreeNode from './components/tree-node/tree-node';

function App(): JSX.Element {
  const root: TreeNode = {
    name: 'root',
    leaves: {}
  };

  return (
    <div className="app">
      <TreeNode node={root} parentPath="" />
    </div>
  );
}

export default App;

/* eslint-disable no-param-reassign */
function getRoot(): TreeNode {
  return {
    name: 'root',
    leaves: {
      devInstance: {
        authKey: 'Adj56Su8kL',
        name: 'devInstance',
        leaves: {
          master: { name: 'master', leaves: {} },
          users: {
            name: 'users',
            leaves: {
              username: { name: 'username', leaves: {} },
              password: { name: 'password', leaves: {} }
            }
          },
          links: {
            name: 'users',
            leaves: {
              linkURL: { name: 'linkURL', leaves: {} }
            }
          }
        }
      },
      logInstance: {
        authKey: 'Adj56Su8kL',
        name: 'logInstance',
        leaves: {
          master: { name: 'master', leaves: {} },
          logs: {
            name: 'logs',
            leaves: {
              level: { name: 'level', leaves: {} },
              message: { name: 'message', leaves: {} }
            }
          }
        }
      },
      prodInstance: {
        name: 'prodInstance',
        authKey: 'ksl5PO6al',
        leaves: {
          master: { name: 'master', leaves: {} },
          users: {
            name: 'users',
            leaves: {
              username: { name: 'username', leaves: {} },
              password: { name: 'password', leaves: {} }
            }
          },
          links: {
            name: 'users',
            leaves: {
              linkURL: { name: 'linkURL', leaves: {} }
            }
          }
        }
      }
    }
  };
}

function shallowCopyNode(toCopy: TreeNode, auth: string): TreeNode {
  const newNode = { name: toCopy.name, leaves: {} as Leaves };
  if (!toCopy.leaves) {
    return newNode;
  }
  Object.keys(toCopy.leaves).forEach((leafName) => {
    const leavesCopy = toCopy.leaves as Leaves;
    if (leavesCopy[leafName].authKey) {
      if (leavesCopy[leafName].authKey === auth) {
        newNode.leaves[leafName] = { name: leafName, leaves: {} };
      }
    } else {
      newNode.leaves[leafName] = { name: leafName, leaves: {} };
    }
  });
  return newNode;
}

function shallowCopyNodeNoAuth(toCopy: TreeNode): TreeNode {
  const newNode = { name: toCopy.name, leaves: {} as Leaves };
  if (!toCopy.leaves) {
    return newNode;
  }
  Object.keys(toCopy.leaves).forEach((leafName: string) => {
    newNode.leaves[leafName] = { name: leafName, leaves: {} };
  });
  return newNode;
}

function addLeaf(
  leafName: string,
  currentPath: string,
  treeToAdd: TreeNode,
  currentNode: TreeNode,
  path: string[],
  auth: string
): boolean {
  // Was the requested path found
  if (!treeToAdd.leaves) {
    treeToAdd.leaves = {} as Leaves;
  }
  if (leafName !== currentPath) {
    treeToAdd.leaves[leafName] = { name: leafName, leaves: {} };
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  treeToAdd.leaves[leafName] = addPathUntil(
    { name: leafName, leaves: {} },
    (currentNode.leaves as Leaves)[leafName],
    path,
    auth
  );
  return true;
}

function addPathUntil(treeToAdd: TreeNode, currentNode: TreeNode, path: string[], auth: string) {
  if (path.length === 0) {
    return shallowCopyNode(currentNode, auth);
  }
  const currentPath = path.shift();
  if (!currentPath || currentPath === '') {
    throw new Error('Illegal path requested');
  }
  if (!currentNode.leaves || currentNode.leaves === {}) {
    (treeToAdd.leaves as Leaves)[currentPath] = { name: currentPath, leaves: {} };
    return treeToAdd;
  }
  let pathExists = false;
  const currentLeaves = currentNode.leaves as Leaves;
  Object.keys(currentLeaves).forEach((leafName) => {
    if (currentLeaves[leafName].authKey) {
      if (currentLeaves[leafName].authKey === auth) {
        pathExists =
          pathExists || addLeaf(leafName, currentPath, treeToAdd, currentNode, path, auth);
      }
    } else {
      pathExists = pathExists || addLeaf(leafName, currentPath, treeToAdd, currentNode, path, auth);
    }
  });
  if (!pathExists) {
    throw new Error('Illegal path requested');
  }
  return treeToAdd;
}

function getTreeNode(root: TreeNode, auth: string, leafPath: string) {
  const [rootPath, connectionPath, ...restOfPath] = leafPath.split('.');
  if (!rootPath || rootPath === '' || rootPath !== 'root') {
    throw new Error('Illegal path requested');
  }
  if (!connectionPath) {
    return shallowCopyNode(root, auth);
  }
  if (connectionPath && root.leaves?.[connectionPath].authKey !== auth) {
    throw new Error('Authentication not valid for this connection');
  }
  return addPathUntil(
    { name: 'root', leaves: {} },
    root,
    [connectionPath].concat(restOfPath),
    auth
  );
}

// Parameters:
//   auth: string;
//     Authentication Key
//     Example: Adj56Su8kL
//   leaf: string;
//     Path to current leaf
//     Example: root.my-connection.some-schema.foo-table

export default function treeAPI(request: any, response: any): void {
  if (!request.leaf || request.leaf === '') {
    response.send('Bad Request');
    return;
  }
  const root: TreeNode = getRoot();
  if (!request.auth || request.auth === '') {
    response.send({
      message: 'Please add auth to see which connection is available for you',
      tree: shallowCopyNodeNoAuth(root)
    });
    return;
  }

  try {
    const tree = getTreeNode(root, request.auth, request.leaf);
    response.send({ tree });
  } catch (error) {
    response.send(error);
  }
}

// import {inspect} from "util";

// treeAPI({leaf: "root.devInstance.users", auth: "Adj56Su8kL"}, {send: (val) => console.log(inspect(val, {
//   colors: true,
//   depth: 10
// }))});

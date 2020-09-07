interface TreeNode {
  name: string;
  authKey?: string;
  leaves: Leaves;
}

type Leaves = { [key: string]: TreeNode };

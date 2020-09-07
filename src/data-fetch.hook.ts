import treeAPI from './services/backend.mock';

export default function dataFetch(path: string, noAuth = false): Promise<TreeNode> {
  return new Promise((resolve, reject) => {
    let request: { leaf: string; auth?: string } = { leaf: path };
    if (!noAuth) {
      const auth = process.env.REACT_APP_AUTH_KEY;
      if (!auth) {
        throw new Error('No auth in config');
      }
      request = { ...request, auth };
    }

    const response = {
      send: (val: any) => {
        if (!val.tree || val.message) {
          console.warn(val.message ? val.message : val);
        }
        if (val.tree) {
          resolve(val.tree);
        } else {
          reject(val);
        }
      }
    };
    treeAPI(request, response);
  });
}

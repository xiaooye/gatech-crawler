const Octokit = require('@octokit/rest');

const octokit = new Octokit();
octokit.authenticate({
  type: 'oauth',
  token: '3c74777595e3877e52948b5121a9023d01ace996',
});

const owner = 'xiaooye';
const repo = 'schedular';
const branch = 'master';

const uploadFile = (path, json, files) => {
  const file = files.find(file => file.path === path);
  const content = Buffer.from(JSON.stringify(json)).toString('base64');
  return file ?
    octokit.repos.updateFile({
      owner,
      repo,
      path,
      message: `Update ${path}`,
      content,
      sha: file.sha,
      branch,
    }).then(() => false) :
    octokit.repos.createFile({
      owner,
      repo,
      path,
      message: `Create ${path}`,
      content,
      branch,
    }).then(() => true);
};

const upload = (term, termData) =>
  octokit.repos.getContent({ owner, repo, path: '', ref: branch })
    .then(response => {
      const files = response.data;
      const path = `${term}.json`;
      return uploadFile(path, termData, files).then(created => {
        if (created) {
          const terms = files.map(file => file.path.split('.')[0]).filter(filename => /\d{6}/.test(filename));
          terms.push(term);
          terms.sort();
          console.log(`Updating 'terms.json' ...`);
          return uploadFile('terms.json', terms, files);
        }
      });
    });

module.exports = upload;

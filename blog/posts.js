const fs = require('fs');
const marked = require('marked');

const posts = [{
  slug: 'rails-k8s',
  title: 'Ruby on Rails on Kubernetes (with CI/CD)',
  filename: 'rails_k8s.md',
}];

module.exports = posts.map(post => {
  const content = fs.readFileSync(`${__dirname}/${post.filename}`).toString();
  return {
    ...post,
    content,
    shortContent: content.substr(0, 170),
    html: marked(content),
  };
});

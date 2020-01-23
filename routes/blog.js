const express = require('express');
const router = express.Router();

const posts = require('../blog/posts');

const active = 'blog';

/* GET home page. */
router.get('/', (req, res) => {
  res.render('blog', { posts: posts, title: 'Blog', active });
});

router.get('/:id', (req, res) => {
  const post = posts.find(post => post.slug === req.params.id);
  res.render('blogpost', { post, title: post.title, active });
})

module.exports = router;

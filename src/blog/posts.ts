import { marked } from "marked";
import railsk8s from "./rails_k8s.md";

const ideas = [
  "Transforming an Engineering culture",
  "Writing good UI tests",
  "Integrating Quickbooks into your Rails app",
  "Wholesome CI/CD pipelines",
  "Building Robust Web Apps in Rust",
];

export const posts = [
  {
    slug: "rails-k8s",
    title: "Ruby on Rails on Kubernetes (with CI/CD)",
    filename: "rails_k8s.md",
    content: railsk8s,
    date: "Jan 22, 2020",
  },
].map((post) => {
  return {
    ...post,
    shortContent:
      post.content.replace(/#[^\n]+/g, "").substring(0, 350) + "...",
    html: marked(post.content) as string,
  };
});

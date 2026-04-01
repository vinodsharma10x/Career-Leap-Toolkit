#!/usr/bin/env node

/**
 * GitHub Profile Fetcher — Pull profile, repos, and skills from GitHub API
 *
 * Usage: node fetch-github.mjs <username>
 * Output: JSON with profile, repos, and extracted skills
 */

const username = process.argv[2];

if (!username) {
  console.error("Usage: node fetch-github.mjs <github_username>");
  process.exit(1);
}

const API_BASE = "https://api.github.com";
const headers = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "CareerLeapToolkit-ResumeSkill",
};

// Use GitHub token if available (higher rate limits)
if (process.env.GITHUB_TOKEN) {
  headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 404) throw new Error(`GitHub user "${username}" not found`);
    if (res.status === 403) throw new Error("GitHub API rate limit exceeded. Set GITHUB_TOKEN env var for higher limits.");
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

try {
  // Fetch profile and repos in parallel
  const [user, repos] = await Promise.all([
    fetchJSON(`${API_BASE}/users/${username}`),
    fetchJSON(`${API_BASE}/users/${username}/repos?sort=pushed&per_page=100`),
  ]);

  // Filter: non-fork, non-archived, sort by stars, take top 15
  const topRepos = repos
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15);

  // Extract skills from languages and topics
  const skills = new Set();
  for (const repo of topRepos) {
    if (repo.language) skills.add(repo.language);
    for (const topic of repo.topics || []) {
      // Clean up topic: "next-js" → "Next.js", "react" → "React"
      const clean = topic
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      skills.add(clean);
    }
  }

  // Build output
  const output = {
    profile: {
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      github_url: user.html_url,
      portfolio_url: user.blog || null,
      twitter_username: user.twitter_username || null,
      public_repos: user.public_repos,
      followers: user.followers,
    },
    repos: topRepos.map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      topics: r.topics || [],
      url: r.html_url,
      homepage: r.homepage,
    })),
    skills: Array.from(skills).sort(),
  };

  console.log(JSON.stringify(output, null, 2));
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

# SSG Publish Drafts (beta)

An utterly simple Github action that lets you publish `draft` posts from a draft posts directory to the directory where your SSG(Static Site Generator) of choice expects your published posts to be.

It's tested and built with [Astro](https://astro.build/) in mind, but as long as your SSG expects the published markdown content in a folder, the job should be as easy as configuring a `draft` and a `published` directory.

## How to configure?
Since the draft posts are posts intended to be published in the future, create posts with future dates in the `/src/drafts` folder.

Go to Github `Actions` tab and add the following lines while configuring your action
```yml

name: Publish Blog Drafts

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '30 */4 * * *' # Every four hours!

jobs:
  publish-drafts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: SSG Publish Drafts
        # You may pin to the exact commit or the version.
        uses: one-aalam/github-action-astro-publish-drafts@v0.1-beta
        with:
          github_token: $\{{ secrets.GITHUB_TOKEN }}
          github_actor: one-aalam # Your Github username
          github_repository: one-aalam/astro-ink-cms # Repository URL
```
You're using `v0.1-beta` of this action,

The above changes will configure `v0.1-beta` of this action with your repo that will run on push, pull and __every 4 hours__


## Why?
There are SSG(Static Site Generators) in the wild like [Jekyll](https://jekyllrb.com) that support the concept of future posts with specially recognized markdown front-matter attributes like `published`, `future` and conventions like having a [`_drafts`](https://jekyllrb.com/docs/structure/). You write your posts with one of these flags or put them in the `_drafts` folder, and Jekyll will bring them in line with published posts if started as `jekyll server --unpublished` or `jekyll server --future`. The third approach with `_drafts` seems to be the cleanest of all as you won't mix up the posts you're working up with the posts that are already published. Plus, you won't need a new attribute to specially know the future posts.

This seems like a very nice-to-have future for a site generation tool but isn't something it must introduce in its markdown compilation pipeline, as it could increase the build time (based on the number of posts). Moreover, you might wanna skip the build, when there are no draft posts.

Seems like a duty that should be done externally? Probably, a script that could be configured through CRON for periodic checks/builds?

Enter github-action-__ssg-publish-drafts__. It's the script you'd like to run for publishing the posts from your draft folder to the folder that auto-generates your pages from the existing markdown posts like `/src/pages/blog/*.md`(Astro). Create posts in a `/src/drafts` directory with the `date` field set to a future date in `YYYY-MM-DD` format, and let this action do the rest. Do a bit of CRON-Jitsu, and run this action at a time more appropriate to your authoring/publishing schedule.

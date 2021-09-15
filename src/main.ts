
import path from 'path'
import {promises as fs} from 'fs'
const env = process.env;

import fm from 'front-matter'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import { exec } from '@actions/exec'

async function run(): Promise<void> {
  try {
    const astroPath = core.getInput('astroPath') || '.'
    const astroSrcDir = path.join(astroPath, 'src')
    const astroDraftsDir = path.join(astroSrcDir, 'drafts')


    core.debug(`Starting the scan for future posts...`)
    const now = new Date();
    let draftCount = 0;
    let fileCount = 0;

    const githubRepository = core.getInput('github_repository')
    const githubActor = core.getInput('github_actor', { required: true } )
    const branch = core.getInput('branch')
    const githubToken = core.getInput('github_token')

    const gitUsername = core.getInput('git_username') || 'github-actions[bot]'
    const gitEmail = core.getInput('git_email') || '41898282+github-actions[bot]@users.noreply.github.com'
    const gitMessage = core.getInput('git_message') || 'Publish Drafts'

    core.debug(`Started the scan at ${now}`)
    core.debug(`Scanning all the files available in ${astroDraftsDir}`)

    if (githubActor) {
        await exec('git', ['config', '--global', 'user.email', gitEmail]);
        await exec('git', ['config', '--global', 'user.name', gitUsername]);
    }

    const patterns = [path.join(astroDraftsDir, '*.md')]
    const globber = await glob.create(patterns.join('\n'), { followSymbolicLinks: false })
    for await (const file of globber.globGenerator()) {
        fileCount += 1;
        const basename = path.basename(file)
        const content = await fs.readFile(file, 'ascii')
        const frontMatter = fm<{date: string}>(content)
        const filePubDate = frontMatter && frontMatter?.attributes?.date
        if(filePubDate) {
            core.debug(`Checking ${file} for publishing`)
            const rdate = new Date(Date.parse(filePubDate));
                if (rdate.getFullYear() >= 2000) {
                    if (now.getTime() >= rdate.getTime()) {
                        core.debug(`Gonna publish ${file} to the "/pages/posts" directory`)
                        const newFile = path.resolve(astroSrcDir, 'pages', 'posts', basename)
                        core.warning(`${file} --> ${newFile}`);
                        await exec('git', ['mv', file , newFile]);
                        draftCount += 1
                    } else {
                        core.debug(`Skipped ${file}. It doesn't seems to be a future post.`)
                    }
            }
        }
    }
    core.warning(`Found ${fileCount} files. Moved drafts: ${draftCount}`);

    if (draftCount > 0) {
        const remote_repo = `https://${githubActor}:${githubToken}@github.com/${githubRepository}.git`;
        await exec('git', ['commit', '-m', gitMessage]);
        await exec('git', ['push', remote_repo, `HEAD:${branch}`, '--follow-tags', '--force']);
    }

    core.setOutput('published', `Published ${draftCount} posts!`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

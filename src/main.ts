
import path from "path"
const env = process.env;

import * as core from '@actions/core'
import * as glob from '@actions/glob'
import { exec } from '@actions/exec'

async function run(): Promise<void> {
  try {
    const astroPath = core.getInput('astroPath') || '.'
    core.debug(`Starting the scan for future posts...`)
    const now = new Date();
    let draftCount = 0;
    const githubActor = core.getInput('github_actor', { required: true } )
    const branch = core.getInput('branch')
    const githubToken = core.getInput('github_token')

    const gitUsername = core.getInput('git_username') || 'github-actions[bot]'
    const gitEmail = core.getInput('git_email') || '41898282+github-actions[bot]@users.noreply.github.com'
    const gitMessage = core.getInput('git_message') || 'Publish Drafts'

    core.debug(`Started the scan at ${now}`)

    const patterns = [path.join(astroPath, 'src', 'drafts', '*.md')]
    const globber = await glob.create(patterns.join('\n'), { followSymbolicLinks: false })
    for await (const file of globber.globGenerator()) {
        draftCount += 1
        console.log(file)
    }

    if (githubActor) {
        await exec('git', ['config', '--global', 'user.email', gitEmail]);
        await exec('git', ['config', '--global', 'user.name', gitUsername]);
    }
    core.setOutput('published', `Published ${draftCount} posts!`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

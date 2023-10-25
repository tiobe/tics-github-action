# TICS GitHub Action

[![Build](https://github.com/tiobe/tics-github-action/actions/workflows/build.yml/badge.svg)](https://github.com/tiobe/tics-github-action/actions/workflows/build.yml)
[![Tests](https://github.com/tiobe/tics-github-action/actions/workflows/test.yml/badge.svg)](https://github.com/tiobe/tics-github-action/actions/workflows/test.yml)
[![CodeQL](https://github.com/tiobe/tics-github-action/actions/workflows/codeql.yml/badge.svg)](https://github.com/tiobe/tics-github-action/actions/workflows/codeql.yml)

The TICS Github action integrates TICS Client analysis to measure your code quality. The incorporated Quality gating feature enables you to analyze and decorate pull requests.

## Before you start

### Prerequisites

- A TICS Viewer (version 2022.4 or higher) running somewhere on the network that is HTTP(S) accessible by the runner on which you want to execute the action.

### Action Restrictions

- It is not working for forked repositories.
- It is not working for TICS installations using the legacy deployment architecture.
- macOS runners (GitHub-hosted or self-hosted) are not yet supported.
- The connected runner should have Git installed.

## Usage

Add the `TICS GitHub Action` to your workflow to launch TICS code analysis and post the results of Quality Gating feature as part of your pull request.
Below is an example of how to include the `TICS GitHub Action` step as part of your workflow:

```
on: [pull_request]

jobs:
  TICS:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: TICS GitHub Action
        uses: tiobe/tics-github-action@v2
        with:
          projectName: 'myproject'
          ticsConfiguration: 'https://url/tiobeweb/TICS/api/cfg?name=myconfiguration'
          githubToken: ${{secrets.GITHUB_TOKEN}}
          ticsAuthToken: ${{secrets.TICSAUTHTOKEN}}
          installTics: true
```

### Action Runners

Linux and Windows based runners, both Github-hosted and self-hosted, are supported.

### Environment Variables

**This method has been depricated as of version 2.0 and has been moved to the action parameters**. The environment variables that are needed for the action to function.

```
env:
    GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
    TICSAUTHTOKEN: ${{secrets.TICSAUTHTOKEN}}
```

- `GITHUB_TOKEN` – Provided by Github automatically in an action (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token)).
- `TICSAUTHTOKEN` – It is required only when the TICS viewer is not publicly accessible and requires an authentication token. You can create a TICS Viewer Authentication token of role 'TICS Client' (see [Configuring a token for TICS Client](https://demo.tiobe.com/tiobeweb/TICS/docs/index.html#doc=admin/admin_11_viewer.html%23auth-token)). You can then assign the TICSAUTHTOKEN value in the "Secrets" settings page of your repository, or add them at the level of your GitHub organization.

### Action Parameters

The following inputs are available for this action:

| Input                  | Description                                                                                                                                                                                                                                                                              | Required |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `githubToken`          | Provided by Github automatically in an action (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token))                                                                         | true     |
| `projectName`          | Name of the TICS project present in the TICS Viewer.                                                                                                                                                                                                                                     | true     |
| `ticsConfiguration`    | A URL pointing to the "cfg" API endpoint of the TICS Viewer. It contains the name of the TICS Analyzer Configuration or "-" in case of the default configuration.                                                                                                                        | true     |
| `branchName`           | Name of the branch in TICS.                                                                                                                                                                                                                                                              | false    |
| `branchDir`            | Location of the files to analyze.                                                                                                                                                                                                                                                        | false    |
| `calc`                 | Comma-separated list of metrics to be used. GATE metric is supported for TICS Viewer versions higher than 2022.2.x. If not specified, `GATE` will be used by default.                                                                                                                    | false    |
| `recalc`               | Comma-separated list of metrics to be recalculated. GATE metric is supported for TICS Viewer versions higher than 2022.2.x.                                                                                                                                                              | false    |
| `clientData`           | A custom client-data token for the purpose of the Client Viewer functionality. This provides a static URL that is updated with every analysis.                                                                                                                                           | false    |
| `codetype`             | Allows you to pick which specific types of code you want to analyze with the TICS client. Options are `PRODUCTION`, `TESTCODE` and `EXTERNAL`.                                                                                                                                           | false    |
| `excludeMovedFiles`    | Exclude moved and renamed files from analysis completely. By default these are included if there are modifications in the file.                                                                                                                                                          | false    |
| `filelist`             | Path to a file containing the files (newline separated) to run TICS for. This can be an absolute or relative (to workspace) path, and can also be `.` to analyze the whole project. This has to be set when the action is run outside of a pull request.                                 | false    |
| `hostnameVerification` | Check whether the certificate matches the server. Options are `1`/`true` or `0`/`false`. [Documentation on Client-side SSL/TLS](https://portal.tiobe.com/2022.2/docs/#doc=admin/admin_11_viewer.html%23ssl-wrapper).                                                                     | false    |
| `trustStrategy`        | Check the validity of certificates. Options are `all`, `self-signed` or `strict`. [Documentation on Client-side SSL/TLS](https://portal.tiobe.com/2022.2/docs/#doc=admin/admin_11_viewer.html%23ssl-wrapper).                                                                            | false    |
| `installTics`          | Boolean parameter to install TICS command-line tools on a runner before executing the analysis. If not specified, TICS should be installed manually on the machine that runs this job.                                                                                                   | false    |
| `mode`                 | Set the mode to run the action in. Options are `default` for a normal analysis run and `diagnostic` for a diagnostic testing of the setup.                                                                                                                                               | false    |
| `postAnnotations`      | Show the latest TICS annotations directly in the GitHub Pull Request review.                                                                                                                                                                                                             | false    |
| `postToConversation`   | Post the summary to the conversation page of the pull request. Options are `true` (default) or `false`.                                                                                                                                                                                  | false    |
| `pullRequestApproval`  | Set the plugin to approve or deny a pull request, by default this is false. Options are `true` or `false`. Note that once a run that added a reviewer has been completed, this reviewer cannot be deleted from that pull request. (Always the case on versions between 2.0.0 and 2.5.0). | false    |
| `retryCodes`           | Status codes to retry api calls for. The default codes will be overwritten if this option is set.                                                                                                                                                                                        | false    |
| `secretsFilter`        | Comma-seperated list of extra secrets to mask in the console output.                                                                                                                                                                                                                     | false    |
| `ticsAuthToken`        | Authentication token to authorize the plugin when it connects to the TICS Viewer.                                                                                                                                                                                                        | false    |
| `tmpDir`               | Location to store debug information.                                                                                                                                                                                                                                                     | false    |
| `viewerUrl`            | The publicly available Viewer URL of TICS viewer to link the links in the review to. (e.g. https://domain.com/tiobeweb/TICS)                                                                                                                                                             | false    |

# Developer notes

- This action requires Node16, it won't work with other Node versions.
- This action is written in TypeScript. To compile the package to JavaScript run `npm run build`.
- To package the build to run run `npm run package`.
- To combine the last two steps run `npm run all`.
- There is Prettier auto-formatting available, run `npm run format` or enable format on save to automate the formatting.
- In order to run the tests the environment variable `INPUT_GITHUBTOKEN` needs to be set with a valid `GITHUB_TOKEN`

## Git hooks

To enable git hooks for auto building [githooks](https://github.com/gabyx/githooks) should be used. This enables the hooks in the `.githooks` folder. Which checks for a correct commit message and auto builds on commit.

## Testing

Testing this action can be done with [nektos/act](https://github.com/nektos/act). The following command can be run after installation to test the plugin.

```
act -s GITHUB_TOKEN=<TOKEN> -s TICSAUTHTOKEN=<TOKEN> -P self-hosted=catthehacker/ubuntu:act-latest --env PULL_REQUEST_NUMBER=<NUMBER>
```

| Variable              | Type        | Description                                          |
| --------------------- | ----------- | ---------------------------------------------------- |
| `GITHUB_TOKEN`        | Secret      | Personal Access Token connected to a GitHub account. |
| `TICSAUTHTOKEN`       | Secret      | Auth token set in the TICS viewer.                   |
| `PULL_REQUEST_NUMBER` | Environment | Number of the pull request to test with.             |

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

```yaml
on: [pull_request]

jobs:
  TICS:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: TICS GitHub Action
        uses: tiobe/tics-github-action@v2
        with:
          projectName: project-name
          ticsConfiguration: https://domain.com/tiobeweb/TICS/api/cfg?name=config
          ticsAuthToken: ${{ secrets.TICSAUTHTOKEN }}
          installTics: true
```

### Action Runners

Linux and Windows based runners, both Github-hosted and self-hosted, are supported.

### Recommended parameters

The following inputs are recommended or required for this action:

| Input               | Description                                                                                                                                                                                                      | Required |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `projectName`       | Name of the TICS project present in the TICS Viewer.                                                                                                                                                             | true     |
| `ticsConfiguration` | A URL pointing to the "cfg" API endpoint of the TICS Viewer. It contains the name of the TICS Analyzer Configuration or "-" in case of the default configuration.                                                | true     |
| `ticsAuthToken`     | Authentication token to authorize the plugin when it connects to the TICS Viewer. (Only required if a token is needed to run TICS.)                                                                              | false    |
| `installTics`       | Boolean parameter to install TICS command-line tools on a runner before executing the analysis. If not specified, TICS should be installed manually on the machine that runs this job, default value is `false`. | false    |

### Optional parameters

| Input                  | Description                                                                                                                                                                                                                                                                              | Default                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `githubToken`          | The action by Github automatically in an action (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token)), can be overridden if needed.                                         | `GITHUB_TOKEN`                           |
| `mode`                 | Set the mode to run the action in. Options are `default` for a normal analysis run and `diagnostic` for a diagnostic testing of the setup.                                                                                                                                               | `default`                                |
| `filelist`             | Path to a file containing the files (newline separated) to run TICS for. This can be an absolute or relative (to workspace) path, and can also be `.` to analyze the whole project. This has to be set when the action is run outside of a pull request.                                 | -                                        |
| `calc`                 | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to be used. The `GATE` metric is supported for TICS Viewer versions higher than 2022.2.x.                                                                 | `GATE`                                   |
| `recalc`               | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to be recalculated. The `GATE` GATE metric is supported for TICS Viewer versions higher than 2022.2.x.                                                    | -                                        |
| `clientData`           | A custom client-data token for the purpose of the Client Viewer functionality. This provides a static URL that is updated with every analysis.                                                                                                                                           | -                                        |
| `branchName`           | Name of the branch in TICS.                                                                                                                                                                                                                                                              | -                                        |
| `codetype`             | Allows you to pick which specific types of code you want to analyze with the TICS client. Options are `PRODUCTION`, `TESTCODE` and `EXTERNAL`.                                                                                                                                           | `PRODUCTION`                             |
| `excludeMovedFiles`    | Exclude moved and renamed files from analysis completely. By default these are included if there are modifications in the file.                                                                                                                                                          | `false`                                  |
| `hostnameVerification` | Check whether the certificate matches the server. Options are `1`/`true` or `0`/`false`. [Documentation on Client-side SSL/TLS](https://portal.tiobe.com/latest/docs/#doc=admin/admin_11_viewer.html%23ssl-wrapper).                                                                     | `true`                                   |
| `trustStrategy`        | Check the validity of certificates. Options are `all`, `self-signed` or `strict`. [Documentation on Client-side SSL/TLS](https://portal.tiobe.com/latest/docs/#doc=admin/admin_11_viewer.html%23ssl-wrapper).                                                                            | `strict`                                 |
| `postAnnotations`      | Show the TICS violations in the changed files window. Options are `true` or `false`.                                                                                                                                                                                                     | `true`                                   |
| `postToConversation`   | Post the summary to the conversation page of the pull request.                                                                                                                                                                                                                           | `true`                                   |
| `pullRequestApproval`  | Set the plugin to approve or deny a pull request, by default this is false. Options are `true` or `false`. Note that once a run that added a reviewer has been completed, this reviewer cannot be deleted from that pull request. (Always the case on versions between 2.0.0 and 2.5.0). | `false`                                  |
| `retryCodes`           | Status codes to retry api calls for. The default codes will be overwritten if this option is set.                                                                                                                                                                                        | `419`, `500`, `501`, `502`, `503`, `504` |
| `secretsFilter`        | Comma-seperated list of extra secrets to mask in the console output.                                                                                                                                                                                                                     | -                                        |
| `showBlockingAfter`    | Show the blocking after violations in the changed files window. Options are `true` or `false`.                                                                                                                                                                                           | `false`                                  |
| `tmpDir`               | Location to store debug information.                                                                                                                                                                                                                                                     | -                                        |
| `viewerUrl`            | The publicly available Viewer URL of TICS viewer to link the links in the review to. (e.g. https://domain.com/tiobeweb/TICS)                                                                                                                                                             | -                                        |

# Developer notes

- This action requires Node16, it won't work with other Node versions.
- This action is written in TypeScript. To compile the package to JavaScript run `npm run build`.
- To package the build to run run `npm run package`.
- To combine the last two steps run `npm run all`.
- There is Prettier auto-formatting available, run `npm run format` or enable format on save to automate the formatting.
- In order to run the integration tests the environment variable `INPUT_GITHUBTOKEN` needs to be set with a valid `GITHUB_TOKEN`

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

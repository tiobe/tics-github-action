# TICS GitHub Action

[![Build](https://github.com/tiobe/tics-github-action/actions/workflows/build.yml/badge.svg)](https://github.com/tiobe/tics-github-action/actions/workflows/build.yml)
[![Tests](https://github.com/tiobe/tics-github-action/actions/workflows/test.yml/badge.svg)](https://github.com/tiobe/tics-github-action/actions/workflows/test.yml)
[![CodeQL](https://github.com/tiobe/tics-github-action/actions/workflows/codeql.yml/badge.svg)](https://github.com/tiobe/tics-github-action/actions/workflows/codeql.yml)

The TICS GitHub action integrates the [TICS code quality framework](https://www.tiobe.com/products/tics/) into your workflows. This allows you to effectively measure and monitor the software code quality of all your projects and their branches.

The incorporated `Quality Gating` feature can be used for `Pull Request` and `Commit` approvals. It can also decorate your pull request so the quality data is easily available. 
Furthermore, the changed files are annotated with findings from the TICS analysis, so it is clear where the issues are and thus where they need to be addressed.

There are two types of analysis modes available:
- Reference runs using TICS QServer (See section QServer). Reference points with code quality metric data are created that are used for the qualification runs. Intended for branches where other branches are derived from and will be merged back to (Like main).
- Qualification runs using TICS Client (See section Client). Compares a set of changed files from a commit or pull request to the reference point for qualification, using a Quality Gate. Intended for any branch that needs to be merged back.

## Before you start
### Prerequisites
A TICS Viewer (version 2022.4 or higher) running somewhere on the network that is HTTP(S) accessible by the runner on which you want to execute the action.

### Supported Platforms
Linux and Windows based runners, both GitHub-hosted and self-hosted, are supported.


### Action Restrictions
- It is not working for forked repositories.
- It is not working for TICS installations using the legacy deployment architecture.
- macOS runners (GitHub-hosted or self-hosted) are not yet supported.
- The connected runner should have Git installed.

# Setup
Add the `TICS GitHub Action` to your workflow to launch TICS code analysis and post the results of Quality Gating feature as part of your pull request. Below are some example of how to include the `TICS GitHub Action` step as part of your workflow.

## Client (default)
The default mode to run is [TICS Client](https://ticsdocumentation.tiobe.com/latest/docs/#doc=user/enduser.html). In this mode, the commit or pull request will be evaluated. The `Quality Gate` determines wether the commit or pull request qualifies for delivery.
The quality gate and measurement results are reported in your action summary and optionally the pull request can be decorated.

Below is an example of the minimum configuration that needs to be created in the workflow to enable TICS Client analysis:

```yaml
on: [pull_request]

jobs:
  TICS:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: TICS GitHub Action
        uses: tiobe/tics-github-action@v3
        with:
          viewerUrl: https://domain.com/tiobeweb/TICS/api/cfg?name=config
          ticsAuthToken: ${{ secrets.TICSAUTHTOKEN }}
          installTics: true
```

### Basic parameters
The following inputs are recommended or required for this action:

| Input           | Description                                                                                                                                                                                                      | Required |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `viewerUrl`     | A URL pointing to the "cfg" API endpoint of the TICS Viewer. It contains the name of the TICS Analyzer Configuration or "-" in case of the default configuration.                                                | true     |
| `project`       | Name of the TICS project present in the TICS Viewer. If not given it will use project `auto` when running Client. Is required for QServer.                                                                       | false    |
| `ticsAuthToken` | Authentication token to authorize the plugin when it connects to the TICS Viewer. (Only required if a token is needed to run TICS.)                                                                              | false    |
| `installTics`   | Boolean parameter to install TICS command-line tools on a runner before executing the analysis. If not specified, TICS should be installed manually on the machine that runs this job, default value is `false`. | false    |

### Advanced parameters
The following options allow to instrument TICS Client more specifically:

| Input                  | Description                                                                                                                                            | Default     |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `calc`                 | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to be used. The `GATE` metric is supported for TICS Viewer versions higher than 2022.2.x.              | `GATE`  |
| `recalc`               | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to be recalculated. The `GATE` GATE metric is supported for TICS Viewer versions higher than 2022.2.x. | -       |
| `nocalc`               | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to not be calculated.   | -           |
| `norecalc`             | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to not be recalculated. | -           |
| `filelist`             | Path to a file containing the files (newline separated) to run TICS for. This can be an absolute or relative (to workspace) path, and can also be `.` to analyze the whole project. This has to be set when the action is run outside of a pull request. | -       |
| `cdtoken`              | A custom client-data token for the purpose of the Client Viewer functionality. This provides a static URL that is updated with every analysis.              | -           |
| `branchname`           | Name of the branch in TICS.                                                                                                                                 | -           |
| `codetype`             | Allows you to pick which specific types of code you want to analyze with the TICS client. Options are `PRODUCTION`, `TESTCODE`, `EXTERNAL` and `GENERATED`. | `PRODUCTION`|
| `excludeMovedFiles`    | Exclude moved and renamed files from analysis completely. By default these are included if there are modifications in the file.                             | `false`     |
| `showBlockingAfter`    | Show the blocking after violations in the changed files window. Options are `true` or `false`.                                                              | `true`      |
| `tmpdir`               | Location to store debug information.                                                                                                                        | -           |

## QServer

As of v3, the option to run [TICSQServer](https://ticsdocumentation.tiobe.com/latest/docs/#doc=admin/admin_A3_qserverref.html) analyses has been made available.
With TICSQServer, persistent measurement points are created which are stored in your Quality Database. These measurement points are used by the TICS Client to determine how the code quality evolved from that point.
TICSQServer can also compare the last obtained results with the previous run and apply Quality Gating.

```yaml
on: [pull_request]

jobs:
  TICS:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: TICS GitHub Action
        uses: tiobe/tics-github-action@v3
        with:
          mode: qserver
          project: project-name
          viewerUrl: https://domain.com/tiobeweb/TICS/api/cfg?name=config
          ticsAuthToken: ${{ secrets.TICSAUTHTOKEN }}
          installTics: true
```

### Basic parameters
The following inputs are recommended or required for this action:

| Input           | Description                                                                                                                                                                                                      | Required |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `viewerUrl`     | A URL pointing to the "cfg" API endpoint of the TICS Viewer. It contains the name of the TICS Analyzer Configuration or "-" in case of the default configuration.                                                | true     |
| `mode`          | Set the mode to run the action in. Options are `client` or `qserver` for an analysis run and `diagnostic` for a diagnostic run to test the setup. The default is `client`.                                       | true     |
| `project`       | Name of the TICS project present in the TICS Viewer.                                                                                                                                                             | true     |
| `ticsAuthToken` | Authentication token to authorize the plugin when it connects to the TICS Viewer. (Only required if a token is needed to run TICS.)                                                                              | false    |
| `installTics`   | Boolean parameter to install TICS command-line tools on a runner before executing the analysis. If not specified, TICS should be installed manually on the machine that runs this job, default value is `false`. | false    |

### Advanced parameters
The following options allow to instrument TICSQServer more specifically:

| Input                  | Description                                                                                                                                            | Default |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------| ------- |
| `calc`                 | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to be used.             | `ALL`   |
| `recalc`               | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to be recalculated.     | -       |
| `nocalc`               | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to not be calculated.   | -       |
| `norecalc`             | Comma-separated list of [metrics](https://portal.tiobe.com/latest/docs/index.html#doc=user/clientoptions.html%23MetricAliases) to not be recalculated. | -       |
| `branchdir`            | Root directory of the source files for the branch.                                                                                                     | -       |
| `branchname`           | Name of the branch in TICS.                                                                                                                            | -       |
| `excludeMovedFiles`    | Exclude moved and renamed files from analysis completely. By default these are included if there are modifications in the file.                        | `false` |
| `showBlockingAfter`    | Show the blocking after violations in the changed files window. Options are `true` or `false`.                                                         | `true`  |
| `tmpdir`               | Location to store debug information.                                                                                                                   | -       |

## Other features
### Action parameters
Below are some special parameters that can be used to control how the GitHub Action posts its results:

| Input                  | Description                                                                                                                                                                                                                                                                              | Default                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `postAnnotations`      | Show the TICS violations in the changed files window. Options are `true` or `false`.                                                                                                                                                                                                     | `true`                                   |
| `postToConversation`   | Post the summary to the conversation page of the pull request.                                                                                                                                                                                                                           | `true`                                   |
| `pullRequestApproval`  | Set the plugin to approve or deny a pull request, by default this is false. Options are `true` or `false`. Note that once a run that added a reviewer has been completed, this reviewer cannot be deleted from that pull request. (Always the case on versions between TICS Github Action 2.0.0 and 2.5.0). | `false`                                  |

### Infrastructural and Security related parameters
Below, parameters are described to control infra structure and security related aspects:
| Input                  | Description                                                                                                                                                                                                                                                                              | Default                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `githubToken`          | Applied automatically in an action (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token)), can be overridden if needed.                                         | `GITHUB_TOKEN`                           |
| `hostnameVerification` | Check whether the certificate matches the server. Options are `1`/`true` or `0`/`false`. [Documentation on Client-side SSL/TLS](https://portal.tiobe.com/latest/docs/#doc=admin/admin_11_viewer.html%23ssl-wrapper).                                                                     | `true`                                   |
| `trustStrategy`        | Check the validity of certificates. Options are `all`, `self-signed` or `strict`. [Documentation on Client-side SSL/TLS](https://portal.tiobe.com/latest/docs/#doc=admin/admin_11_viewer.html%23ssl-wrapper).                                                                            | `strict`                                 |
| `retryCodes`           | Status codes to retry api calls for. The default codes will be overwritten if this option is set.                                                                                                                                                                                        | `419`, `500`, `501`, `502`, `503`, `504` |
| `secretsFilter`        | Comma-separated list of extra secrets to mask in the console output.                                                                                                                                                                                                                     | -                                        |
| `displayUrl`           | The URL that end-users need to visit the TICS Viewer. This can differ from the viewerURL if TICS Client and TICSQServer communicate via a reverse proxy, but the end-users have direct access. (e.g. https://domain.com/tiobeweb/TICS)             | -                                        |

### Diagnostic Analysis mode

There is also the possibility to do a so called "diagnostic" run. This mode can be enabled to test if TICS has been set up properly and can run on the machine the action is run on.

```yaml
on: [pull_request]

jobs:
  TICS:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: TICS GitHub Action
        uses: tiobe/tics-github-action@v3
        with:
          mode: diagnostic
          viewerUrl: https://domain.com/tiobeweb/TICS/api/cfg?name=config
          ticsAuthToken: ${{ secrets.TICSAUTHTOKEN }}
          installTics: true
```
#### Basic parameters
The following inputs are recommended or required for this action:

| Input           | Description                                                                                                                                                                                                      | Required |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `viewerUrl`     | A URL pointing to the "cfg" API endpoint of the TICS Viewer. It contains the name of the TICS Analyzer Configuration or "-" in case of the default configuration.                                                | true     |
| `mode`          | Set the mode to run the action in. Options are `client` or `qserver` for an analysis run and `diagnostic` for a diagnostic run to test the setup. The default is `client`.                                       | true     |
| `ticsAuthToken` | Authentication token to authorize the plugin when it connects to the TICS Viewer. (Only required if a token is needed to run TICS.)                                                                              | false    |
| `installTics`   | Boolean parameter to install TICS command-line tools on a runner before executing the analysis. If not specified, TICS should be installed manually on the machine that runs this job, default value is `false`. | false    |

## Migration from v2 to v3
The interface (running with parameters) has been changed to better reflect its usage. This interface is now more synchronized with TICS command line usage, and have been changed to be closer to other plugins that TIOBE provides.
Parameter Changes (v2/old -> v3/new):
- ticsConfiguration -> viewerUrl
- viewerUrl -> displayUrl
- projectName -> project
- branchName -> branchname
- branchDir -> branchdir
- clientData -> cdtoken
- tmpDir -> tmpdir

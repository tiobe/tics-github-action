## TICS GitHub Action
The TiCS Github action integrates TiCS Client analysis to measure your code quality. The incorporated Quality gating feature enables you to analyze and decorate pull requests.

## Before you start 
### Prerequisites
- A TiCS Viewer running somewhere on the network that is HTTP(S) accessible by the runner on which you want to execute the action.

### Action Restrictions
- It will only be triggered on a pull request event.
- It is not working for forked repositories.
- It is not working for TiCS installations using the legacy deployment architecture.
- macOS runners (GitHub-hosted or self-hosted) are not yet supported.

## Usage
Add the `TiCS GitHub Action` to your workflow to launch TiCS code analysis and post the results of Quality Gating feature as part of your pull request.
Below is an example of how to include the `TiCS GitHub Action` step as part of your workflow:

```
name: Main Workflow 

on:
  pull_request: 
        types: [ opened, edited, synchronize, reopened ] 

jobs:
  TiCS-CI:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # Triggering TiCS analysis and posting the results of Quality Gating feature as part of the pull request.
      - name: TiCS GitHub Action
        uses: tiobe/tics-github-action@v1.0.0
        env: 
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          TICSAUTHTOKEN: ${{secrets.TICSAUTHTOKEN}}
        with:
          projectName: 'myproject'
          ticsConfiguration: 'https://192.168.1.1/tiobeweb/TICS/api/cfg?name=myconfiguration'
          clientToken: 'myclienttoken'
          calc: 'GATE'
          installTics: true
```
### Action Runners
Linux and Windows based runners, both Github-hosted and self-hosted, are supported.

### Environment Variables
The environment variables that are necessary for the action to function:

```
env: 
    GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
    TICSAUTHTOKEN: ${{secrets.TICSAUTHTOKEN}}
```

- `TICSAUTHTOKEN` – It is required only when the TiCS viewer is not publicly accessible and requires an authentication token. You can create a TiCS Viewer Authentication token of role 'TICS Client' (see [Configuring a token for TICS Client](https://demo.tiobe.com/tiobeweb/TICS/docs/index.html#doc=admin/admin_11_viewer.html%23auth-token)). You can then assign the TICSAUTHTOKEN value in the "Secrets" settings page of your repository, or add them at the level of your GitHub organization.
- `GITHUB_TOKEN` – Provided by Github (see [Authenticating with the GITHUB_TOKEN](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token)).


### Action Parameters
The following inputs are available for this action:

 |Input|Description|Required|
 |---|---|---|
 | `projectName` | Name of the TiCS project present in the TICS Viewer. |true|
 | `branchName` | Name of the branch in TiCS. | false |
 | `branchDir` | Location of the files to analyze. | false |
 | `calc` | Comma-separated list of metrics to be used. GATE metric is supported for TiCS Viewer versions higher than 2022.2.x. If not specified, GATE will be used by default. | false|
 | `clientToken` | A custom client-data token for the purpose of the Client Viewer functionality. This provides a static URL that is updated with every analysis. | false |
 | `tmpDir` | Location to store debug information. | false |
 | `installTics`| Boolean parameter to install TiCS command-line tools on a runner before executing the analysis. If not specified, TiCS should be installed manually on the machine that runs this job. | false |
 | `ticsConfiguration` | A URL pointing to the "cfg" API endpoint of the TiCS Viewer. It contains the name of the TiCS Analyzer Configuration or "-" in case of the default configuration. | true |
 

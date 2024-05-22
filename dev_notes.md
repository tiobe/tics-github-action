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

In order to run the tests locally a [GitHub token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) is needed to run some integration tests. To set enable these tests the environment variable `INPUT_GITHUBTOKEN` needs to be set.

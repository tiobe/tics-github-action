import { readFileSync, writeFileSync } from 'fs';
import { dirname, relative } from 'path/posix';
import { parse, stringify } from 'yaml';

interface ActionInput {
  description: string;
  required?: boolean;
  default?: string | number | boolean;
  deprecationMessage?: string;
}

interface ActionOutput {
  description: string;
  value?: string;
}

interface ActionBranding {
  icon: string;
  color: string;
}

interface ActionYaml {
  name: string;
  author?: string;
  description: string;
  inputs: Record<string, ActionInput>;
  outputs: Record<string, ActionOutput>;
  branding: ActionBranding;
}

interface NodeRuns {
  using: string;
  main: string;
  env: Record<string, string>;
}

interface NodeYaml extends ActionYaml {
  runs: NodeRuns;
}

interface DockerRuns {
  using: 'docker';
  image: string;
  env?: Record<string, string>;
}

interface DockerYaml extends ActionYaml {
  runs: DockerRuns;
}

const sourcePath = './action.yaml';
const targetPath = './docker/action.yaml';

function main() {
  const rawYaml = readFileSync(sourcePath, 'utf8');
  const nodeYaml = parse(rawYaml) as NodeYaml;

  const dockerYaml: DockerYaml = {
    ...nodeYaml,
    runs: {
      using: 'docker',
      image: 'Dockerfile'
    }
  };

  const body = stringify(dockerYaml, {
    lineWidth: 0,
    defaultStringType: 'QUOTE_DOUBLE',
    defaultKeyType: 'PLAIN'
  });

  const relativeSource = relative(dirname(targetPath), sourcePath);
  const header = ['# GENERATED FILE - DO NOT EDIT DIRECTLY.', `# Source: ${relativeSource}`, ''].join('\n');

  const document = header + body;

  writeFileSync(targetPath, document, 'utf-8');
  console.log(`Generated ${targetPath} from ${sourcePath}`);
}

main();

import { BeachballConfig } from 'beachball';
import { renderHeader, renderEntry } from './customRenderers';
import { getScopes } from './getScopes';
import { getVNextChangelogGroups } from './getVNextChangelogGroups';
import { writeFile } from 'fs-extra';
import { exec } from 'child_process';
import * as path from 'path';

export const config: BeachballConfig = {
  disallowedChangeTypes: ['major', 'prerelease'],
  tag: 'latest',
  generateChangelog: true,
  scope: getScopes(),
  registry:
    'https://uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/registry/',
  changelog: {
    customRenderers: {
      renderHeader,
      renderEntry,
    },
    groups: [getVNextChangelogGroups()],
  },
  hooks: {
    prepublish: packagePath => {
      const authToken = process.env.ADO_TOKEN;
      return writeFile(
        path.join(packagePath, '.npmrc'),
        `
; begin auth token
//uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/registry/:username=uifabric
//uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/registry/:_password=${authToken}
//uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/registry/:email=npm requires email to be set but doesn't use the value
//uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/:username=uifabric
//uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/:_password=${authToken}
//uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
      `,
      );
    },
    postpublish: async (packagePath, name, version) => {
      // Following https://github.com/microsoft/fluentui/pull/20352 all prerelease versions are released with `latest`
      // Adds a post publish hook to continue to tag prerelease versions with appropriate tags
      // can be removed once v9 is fully released
      const tag = 'beta';
      if (version.includes(tag) && process.env.RELEASE_VNEXT) {
        return new Promise((resolve, reject) => {
          console.log(`tagging ${name}@${version} with ${tag}`);
          const registry =
            'https://uifabric.pkgs.visualstudio.com/4ed167b9-ac3a-405b-b967-443af8db8961/_packaging/ling-test/npm/registry/';

          exec(`npm dist-tag --registry ${registry} add ${name}@${version} ${tag}`, (error, stdout, stderr) => {
            if (error && error.code !== 0) {
              console.error(`failed to tag ${name} with ${tag}`);
              console.error(stderr);
              reject();
              return;
            }

            console.log(stdout);
            resolve();
          });
        });
      }
    },
  },
};

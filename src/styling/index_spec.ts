import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import * as path from 'path';

import { Schema as StylingOptions } from './schema';
import { VirtualTree, Tree } from '@angular-devkit/schematics';

describe('Styling Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'nativescript-schematics',
    path.join(__dirname, '../collection.json'),
  );

  const appPath = 'foo';
  const sourceDir = 'app';
  const defaultOptions: StylingOptions = {
    appPath,
    sourceDir,
    extension: 'css',
    theme: true,
  };
  let appTree: Tree;

  beforeEach(() => {
    appTree = new VirtualTree();
    appTree.create(`${appPath}/package.json`, '{}');
  });

  describe('when css is used', () => {
    let extension: string;
    let stylingFile: string;
    beforeEach(() => {
      extension = 'css';
      stylingFile = `/${appPath}/${sourceDir}/app.css`;
    });

    it('should create app.css file', () => {
      const options: StylingOptions = {
        ...defaultOptions,
        extension,
      };
      const tree = schematicRunner.runSchematic('styling', options, appTree); 

      expect(tree.exists(stylingFile));
    });

    it('should not add scss dependencies to package.json', () => {
      const options: StylingOptions = {
        ...defaultOptions,
        extension,
      };
      const tree = schematicRunner.runSchematic('styling', options, appTree); 

      const content = getFileContent(tree, `${appPath}/package.json`);
      expect(content).not.toMatch('"nativescript-dev-sass": ');
    });

    it('should handle the theme flag', () => {
      const options: StylingOptions = {
        ...defaultOptions,
        extension,
        theme: false,
      };
      const tree = schematicRunner.runSchematic('styling', options, appTree); 

      expect(getFileContent(tree, stylingFile))
        .not
        .toMatch(new RegExp('@import "~nativescript-theme-core/css/core.light.css";'));
    });
  });

  describe('when scss is used', () => {
    let extension: string;
    beforeEach(() => {
      extension = 'scss';
    });

    it('should create scss file', () => {
      const options: StylingOptions = {
        ...defaultOptions,
        extension,
      };
      const tree = schematicRunner.runSchematic('styling', options, appTree); 

      expect(tree.exists(`${appPath}/${sourceDir}/app.android.scss`));
      expect(tree.exists(`${appPath}/${sourceDir}/app.ios.scss`));
      expect(tree.exists(`${appPath}/${sourceDir}/_app-common.scss`));
      expect(tree.exists(`${appPath}/${sourceDir}/_app-variables.scss`));
    });

    it('should add scss dependencies to package.json', () => {
      const options: StylingOptions = {
        ...defaultOptions,
        extension,
      };
      const tree = schematicRunner.runSchematic('styling', options, appTree); 

      const content = getFileContent(tree, `${appPath}/package.json`);
      expect(content).toMatch('"nativescript-dev-sass": ');
    });

    it('should handle the theme flag', () => {
      const options: StylingOptions = {
        ...defaultOptions,
        extension,
        theme: false,
      };
      const tree = schematicRunner.runSchematic('styling', options, appTree); 

      expect(getFileContent(tree, `${appPath}/${sourceDir}/app.android.scss`))
        .not
        .toMatch(new RegExp('@import \'~nativescript-theme-core/scss/index\';'));
      expect(getFileContent(tree, `${appPath}/${sourceDir}/app.android.scss`))
        .not
        .toMatch(new RegExp('@import \'~nativescript-theme-core/scss/platforms/index.android\';'));

      expect(getFileContent(tree, `${appPath}/${sourceDir}/app.ios.scss`))
        .not
        .toMatch(new RegExp('@import \'~nativescript-theme-core/scss/index\';'));
      expect(getFileContent(tree, `${appPath}/${sourceDir}/app.ios.scss`))
        .not
        .toMatch(new RegExp('@import \'~nativescript-theme-core/scss/platforms/index.ios\';'));

      expect(getFileContent(tree, `${appPath}/${sourceDir}/_app-variables.scss`))
        .not
        .toMatch(new RegExp('@import \'~nativescript-theme-core/scss/light\';'));
    });
  });
}); 
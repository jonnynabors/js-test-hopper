import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.jsTestJumper",
    async () => {
      const filePath = vscode.window.activeTextEditor?.document.fileName;
      const [fileName, fileDelimitter, fileExtension] = path
        .basename(filePath!)
        .split(".");

      let theFileIWantToHopTo = "";
      if (isThisATestFile(fileDelimitter)) {
        // You're in a test file, you should find the corresponding implementation
        theFileIWantToHopTo = `**/${fileName}.${fileExtension}`;
      } else {
        // You're not in a test file, but should go to one that is either **.spec.extension or **.test.extension
        // TODO: Don't hardcode this, either look around and see if files have *.spec or *.test or just try one of both /shrug
        theFileIWantToHopTo = testFileGlob();
      }

      try {
        const files = await vscode.workspace.findFiles(theFileIWantToHopTo);
        const filePaths = files.map(file => file.path);
        const filesWeFound = isThereATestFileWithThisName(fileName, filePaths);
        if (filesWeFound) {
          vscode.commands.executeCommand(
            "vscode.open",
            vscode.Uri.file(filesWeFound)
          );
        } else {
          return;
        }
      } catch (error) {
        console.error(error);
      }
    }
  );
  context.subscriptions.push(disposable);
}

// TODO: Use a glob!
const isThisATestFile = (fileType: string) => {
  return fileType === "spec" || fileType === "test";
};

// TODO: Improve this matcher. I don't know why the ones here don't work:
// https://jestjs.io/docs/en/configuration#testmatch-arraystring
// Using a glob tester seemed to work, this my be a nuance with VSCode's API
const testFileGlob = () => {
  return `**/*.{test,spec}.{ts,js,jsx}`;
};

const isThereATestFileWithThisName = (
  fileName: string,
  filesWeFound: string[]
) => {
  return filesWeFound.find(theFile => theFile.includes(fileName));
};
export function deactivate() {}

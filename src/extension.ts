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
        // If you're in a test file, you should find the corresponding implementation
        theFileIWantToHopTo = `**/${fileName}.${fileExtension}`;
      } else {
        // You're not in a test file, but should go to one that is either **.spec.extension or **.test.extension
        // TODO: Don't hardcode this, either look around and see if files have *.spec or *.test or just try one of both /shrug
        theFileIWantToHopTo = `**/${fileName}.test.${fileDelimitter}`;
      }

      try {
        const files = await vscode.workspace.findFiles(
          theFileIWantToHopTo,
          undefined,
          undefined,
          undefined
        );
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.file(files[0].path)
        );
      } catch (error) {
        console.error(error);
      }
    }
  );
  context.subscriptions.push(disposable);
}

const isThisATestFile = (fileType: string) => {
  return fileType === "spec" || fileType === "test";
};
// this method is called when your extension is deactivated
export function deactivate() {}

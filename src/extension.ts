// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { html2ft } from "./converter";
import { indent } from "./helpers";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // XX: keeping this here for posterity
  // const getCurrentSelectionStartCol = (editor: vscode.TextEditor) => {
  //   // re: https://stackoverflow.com/questions/64791832/vscode-how-can-i-determine-the-cursors-column-position-within-an-editor
  //   let offset = editor.document.offsetAt(editor.selection.start);
  //   const line = editor.selection.start.line;
  //   for (let i = 0; i < line; i++) {
  //     offset -= editor.document.lineAt(i).text.length + 1;
  //   }
  //   return offset;
  // };

  const countSpaces = (editor: vscode.TextEditor) => {
    return editor.document
      .lineAt(editor.selection.start.line)
      .text.search(/\S/);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("html2ft.convert", () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      const document = editor.document;
      const selection = editor.selection;
      const originalText = document.getText(selection);

      try {
        const convertedText = indent(
          html2ft(
            originalText,
            vscode.workspace.getConfiguration("html2ft").get("attrs1st")
          ),
          countSpaces(editor)
        );

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, convertedText);
        });
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("Failed to convert HTML to FT");
        editor.edit((editBuilder) => {
          editBuilder.replace(selection, originalText);
        });
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

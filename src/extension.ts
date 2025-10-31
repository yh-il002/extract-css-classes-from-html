// パブリッシュしてパッケージ化する方法
// npm run vscode:prepublish
// npx vsce package

// ⌘ + shift + p でコマンドパレットを開いて
// Extensions: Install from VSIX...
// .vsix を選択 → インストール完了拡張

// 使い方
// コマンドパレット (Cmd+Shift+P) で「Extract CSS Classes from HTML」と検索。

import * as vscode from 'vscode';
import { TextEncoder } from 'util';

export function activate(context: vscode.ExtensionContext) {
  // 既存: QuickPick に表示する最小版
  const disposable1 = vscode.commands.registerCommand('extension.extractHtmlClasses', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('エディタが開かれていません');
      return;
    }

    const text = editor.document.getText();
    const classes = extractClasses(text);

    if (classes.length === 0) {
      vscode.window.showInformationMessage('クラスは見つかりませんでした');
      return;
    }

    vscode.window.showQuickPick(classes, { placeHolder: '抽出されたCSSクラス一覧' });
  });

  // 新規: 選択範囲のみ → ファイル保存
  const disposable2 = vscode.commands.registerCommand('extension.extractHtmlClassesToFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('エディタが開かれていません');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText || selectedText.trim().length === 0) {
      vscode.window.showWarningMessage('選択範囲が空です。解析したいHTML部分を選択してください。');
      return;
    }

    const classes = extractClasses(selectedText);
    if (classes.length === 0) {
      vscode.window.showInformationMessage('選択範囲内にCSSクラスは見つかりませんでした。');
      return;
    }

    // 保存ダイアログ
    const uri = await vscode.window.showSaveDialog({
      saveLabel: '保存',
      filters: {
        'Text Files': ['txt'],
        'All Files': ['*']
      },
      // デフォルトのファイル名例
      defaultUri: vscode.workspace.workspaceFolders?.[0]
        ? vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'extracted-classes.txt')
        : undefined
    });
    if (!uri) return;

    const content = classes.join('\n');
    const encoder = new TextEncoder();
    try {
      await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
      vscode.window.showInformationMessage(`CSSクラスを保存しました: ${uri.fsPath}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`保存に失敗しました: ${err?.message ?? String(err)}`);
    }
  });

  context.subscriptions.push(disposable1, disposable2);
}

// 共通：クラス抽出（重複除去 & ソート）
function extractClasses(text: string): string[] {
  // class="..." または class='...' を対象
  const classRegex = /class\s*=\s*["']([^"']+)["']/g;
  const matches = [...text.matchAll(classRegex)];

  const classes = new Set<string>();
  for (const match of matches) {
    match[1]
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(cls => classes.add(cls));
  }
  return Array.from(classes).sort((a, b) => a.localeCompare(b));
}

export function deactivate() {}

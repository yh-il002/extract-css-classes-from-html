// パブリッシュしてパッケージ化する方法
// npm run vscode:prepublish
// npx vsce package

// ⌘ + shift + p でコマンドパレットを開いて
// Extensions: Install from VSIX...
// .vsix を選択 → インストール完了拡張

// 使い方
// コマンドパレット (Cmd+Shift+P) で「Extract CSS Classes from HTML」と検索。

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // クリップボードに保存
  const disposable = vscode.commands.registerCommand('extension.extractHtmlClassesToClipboard', async () => {
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

    const content = classes.join('\n');
    try {
      await vscode.env.clipboard.writeText(content);
      vscode.window.showInformationMessage(`${classes.length}個のCSSクラスをクリップボードにコピーしました`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`クリップボードへのコピーに失敗しました: ${err?.message ?? String(err)}`);
    }
  });

  context.subscriptions.push(disposable);
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

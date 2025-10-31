"use strict";
// パブリッシュしてパッケージ化する方法
// npm run vscode:prepublish
// npx vsce package
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// ⌘ + shift + p でコマンドパレットを開いて
// Extensions: Install from VSIX...
// .vsix を選択 → インストール完了拡張
// 使い方
// コマンドパレット (Cmd+Shift+P) で「Extract CSS Classes from HTML」と検索。
const vscode = __importStar(require("vscode"));
function activate(context) {
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
        }
        catch (err) {
            vscode.window.showErrorMessage(`クリップボードへのコピーに失敗しました: ${err?.message ?? String(err)}`);
        }
    });
    context.subscriptions.push(disposable);
}
// 共通：クラス抽出（重複除去 & ソート）
function extractClasses(text) {
    // class="..." または class='...' を対象
    const classRegex = /class\s*=\s*["']([^"']+)["']/g;
    const matches = [...text.matchAll(classRegex)];
    const classes = new Set();
    for (const match of matches) {
        match[1]
            .split(/\s+/)
            .map(s => s.trim())
            .filter(Boolean)
            .forEach(cls => classes.add(cls));
    }
    return Array.from(classes).sort((a, b) => a.localeCompare(b));
}
function deactivate() { }

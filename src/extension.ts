// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import FileUploadClass from "./utils";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const fileUploadFn = async () => {
    const qiniuConfig = vscode.workspace.getConfiguration("qiniu_config");
    const upload = new FileUploadClass(
      qiniuConfig.accessKey,
      qiniuConfig.secretKey,
      qiniuConfig.bucket
    );
    const uri = await vscode.window.showOpenDialog({
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        images: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
      },
    });

    if (uri) {
      upload.uploadFile(
        upload.getpicName(uri[0].fsPath),
        uri[0].fsPath,
        (respErr, respBody, respInfo) => {
          if(respErr){
            vscode.window.showErrorMessage("上传失败，请检查七牛云配置");
          }
          if (respInfo.statusCode === 200) {
            urlToEditor(qiniuConfig.domain + respBody.key);
            return;
          } else {
            vscode.window.showErrorMessage("上传失败，请检查七牛云配置");
          }
        }
      );
    }
  };

  let disposable = vscode.commands.registerCommand(
    "qiniu.commamdsUploadImage",
    () => {
      fileUploadFn();
    }
  );

  let fileUpload = vscode.commands.registerTextEditorCommand(
    "qiniu.uploadImage",
    () => {
      fileUploadFn();
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(fileUpload);
}
// 将图片链接写入编辑器
function urlToEditor(url: string) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  // 替换内容
  const selection = editor.selection;
  editor.edit((editBuilder) => {
    editBuilder.replace(selection, url);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}

const qiniu = require("qiniu");

class FileUploadService {
  private accessKey: string;
  private secretKey: string;
  private bucket: string;
  constructor(
    accessKey: string,
    secretKey: string,
    bucket: string
  ) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.bucket = bucket;
  }
  //获取上传Token
  getUptoken() {
    var mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
    var options = {
      scope: this.bucket,
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
  }
  //上传
  uploadFile(
    key: string,
    localFile: string,
    callback: (
      respErr: any,
      respBody: any,
      respInfo: { statusCode: number }
    ) => void
  ) {
    const token = this.getUptoken();
    var formUploader = new qiniu.form_up.FormUploader();
    var extra = new qiniu.form_up.PutExtra();
    formUploader.putFile(
      token,
      key,
      localFile,
      extra,
      (respErr: any, respBody: any, respInfo: { statusCode: number }) => {
        callback(respErr, respBody, respInfo);
      }
    );
  }
  getpicName(url: string) {
    let fileName = "";
    if (url.indexOf("\\") > 0) {
      fileName = url.substring(url.lastIndexOf("\\") + 1, url.length);
    }
    return fileName;
  }
}
export default FileUploadService;

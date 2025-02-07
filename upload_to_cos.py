import os
import sys
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException

# 获取环境变量
secret_id = os.getenv('TENCENT_SECRET_ID')
secret_key = os.getenv('TENCENT_SECRET_KEY')
region = os.getenv('TENCENT_REGION')
bucket_name = os.getenv('TENCENT_BUCKET_NAME')

# 初始化配置
token = None  # 使用临时密钥需要传入 token，默认为空
scheme = 'https'  # 指定使用 https 协议

config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key, Token=token, Scheme=scheme)
client = CosS3Client(config)

# 上传文件
def upload_file(local_file, cos_file):
    try:
        response = client.upload_file(
            Bucket=bucket_name,
            LocalFilePath=local_file,
            Key=cos_file
        )
        print(f"Uploaded {local_file} to {cos_file}")
    except TencentCloudSDKException as e:
        print(e)
        sys.exit(1)

# 遍历 dist 目录并上传文件
for root, dirs, files in os.walk('dist'):
    for file in files:
        local_file = os.path.join(root, file)
        cos_file = os.path.relpath(local_file, 'dist')
        upload_file(local_file, cos_file)
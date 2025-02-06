import os
import sys
import tencentcloud.cos.v5.cos_client as cos_client
import tencentcloud.cos.v5.exception.cos_exception as cos_exception
from tencentcloud.common import credential
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile

# 获取环境变量
secret_id = os.getenv('TENCENT_SECRET_ID')
secret_key = os.getenv('TENCENT_SECRET_KEY')
region = os.getenv('TENCENT_REGION')
bucket_name = os.getenv('TENCENT_BUCKET_NAME')

# 初始化凭证
cred = credential.Credential(secret_id, secret_key)

# 初始化 HTTPProfile
http_profile = HttpProfile()
http_profile.endpoint = f"cos.{region}.myqcloud.com"

# 初始化 ClientProfile
client_profile = ClientProfile()
client_profile.httpProfile = http_profile

# 初始化 COS 客户端
cos_client = cos_client.CosClient(cred, region, client_profile)

# 上传文件
def upload_file(local_file, cos_file):
    try:
        response = cos_client.upload_file(
            Bucket=bucket_name,
            LocalFilePath=local_file,
            Key=cos_file
        )
        print(f"Uploaded {local_file} to {cos_file}")
    except cos_exception.CosServiceError as e:
        print(e.get_error_code())
        print(e.get_error_message())
        sys.exit(1)

# 遍历 dist 目录并上传文件
for root, dirs, files in os.walk('dist'):
    for file in files:
        local_file = os.path.join(root, file)
        cos_file = os.path.relpath(local_file, 'dist')
        upload_file(local_file, cos_file)
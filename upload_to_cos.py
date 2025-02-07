import os
import sys
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from qcloud_cos.cos_exception import CosClientError, CosServiceError


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

# 上传文件夹
def upload_folder(local_folder, cos_folder):
    try:
        response = client.upload_folder(
            Bucket=bucket_name,
            LocalFolder=local_folder,
            RemoteFolder=cos_folder
        )
        print(f"Uploaded folder {local_folder} to {cos_folder}")
    except CosClientError as e:
        print(f"CosClientError: {e}")
        sys.exit(1)
    except CosServiceError as e:
        print(f"CosServiceError: {e}")
        sys.exit(1)

# 上传 dist 文件夹
local_folder = 'dist'
cos_folder = 'project-flomo'  # 如果要上传到根目录，可以留空；否则指定子目录
upload_folder(local_folder, cos_folder)
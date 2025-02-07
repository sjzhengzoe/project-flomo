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

# 上传文件
def upload_file(local_file, cos_file, max_retries=3, retry_delay=5):
    attempt = 0
    while attempt < max_retries:
        try:
            response = client.upload_file(
                Bucket=bucket_name,
                LocalFilePath=local_file,
                Key=cos_file
            )
            print(f"Uploaded {local_file} to {cos_file}")
            return
        except (CosClientError, CosServiceError) as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            attempt += 1
            if attempt < max_retries:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Max retries reached. Failed to upload {local_file} to {cos_file}")
                sys.exit(1)

# 上传文件夹
def upload_folder(local_folder, cos_folder):
    for root, dirs, files in os.walk(local_folder):
        for file in files:
            local_file = os.path.join(root, file)
            cos_file = os.path.relpath(local_file, local_folder)
            if cos_folder:
                cos_file = os.path.join(cos_folder, cos_file)
            upload_file(local_file, cos_file)

# 上传 dist 文件夹
local_folder = 'dist'
cos_folder = 'project-flomo'  # 如果要上传到根目录，可以留空；否则指定子目录
upload_folder(local_folder, cos_folder)
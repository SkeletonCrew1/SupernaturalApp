"""S3 storage for post images"""

import uuid

import boto3
from django.conf import settings


def _get_s3_client():
    """Returns a boto3 S3 client configured for AWS"""
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
    )


def upload_image(file) -> str:
    """Uploads an image and returns its public URL"""
    s3 = _get_s3_client()
    key = f"posts/{uuid.uuid4()}-{file.name}"
    s3.upload_fileobj(
        file,
        settings.AWS_STORAGE_BUCKET_NAME,
        key,
        ExtraArgs={"ContentType": file.content_type},
    )
    return key


def get_presigned_url(key: str) -> str:
    """Generates a temporary URL for viewing a private S3 object"""
    s3 = _get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": key},
        ExpiresIn=3600,
    )

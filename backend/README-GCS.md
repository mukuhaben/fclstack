Google Cloud Storage (GCS) setup for persistent image uploads

1) Enable GCS and create a bucket (free tier OK)
- Create a Google Cloud project
- Enable the "Cloud Storage" API
- Create a bucket (e.g. my-app-uploads). For simplicity, set "Uniform access" and allow public reads for objects.

2) Create a Service Account and key
- Roles: Storage Object Admin (or Storage Admin for simplicity; reduce later)
- Create JSON key and download it
- Place it at backend/gcp-service-account.json (or anywhere) and set GOOGLE_APPLICATION_CREDENTIALS to its absolute path

3) Environment variables (.env)
Copy .env.example to .env and fill:

GCS_PROJECT_ID=<your-project-id>
GCS_BUCKET_NAME=<your-bucket-name>
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/gcp-service-account.json
GCS_PUBLIC_BASE_URL= (optional; otherwise uses https://storage.googleapis.com/<bucket>)
DEFAULT_AVATAR_URL= (optional)
DEFAULT_PRODUCT_IMAGE_URL= (optional)

4) Install deps and run
npm install
npm run dev

5) Behavior changes
- Upload endpoints now stream to GCS using memory storage
- DB stores object keys (e.g. profiles/filename.jpg, products/filename.jpg)
- API responses return full public URLs for frontend rendering
- Deletions remove GCS objects as well

6) Frontend
- No changes required; continue to use avatar_url, primary_image, imageUrl fields from the API


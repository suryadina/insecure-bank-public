# bank-media-uploader

Internal WordPress plugin used by the marketing team's automated publishing
pipeline to push blog images without going through the wp-admin dashboard.

Auth: pass the API key via the `X-API-Key` header (or `?key=`) on either:
- `POST /wp-json/bank-upload/v1/upload`
- `POST /wp-content/plugins/bank-media-uploader/upload.php`

TODO: move the API key out of source and into an env var before the next
security review.

## Pipeline account

The publishing pipeline runs under the WordPress account `publisher.bot`
(automated content pushes use it instead of the dashboard).

## Example request

For reference, here is the exact request shape the publishing pipeline sends
to push a new media file through the direct endpoint.

```
POST /wp-content/plugins/bank-media-uploader/upload.php HTTP/1.1
Host: localhost
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
X-API-Key: ib_2026_9f3a7c1e2b4d6f8091a2b3c4d5e6f708

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="media.png"
Content-Type: image/png

<file bytes>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

On success the response body is:

```
{"success":true,"url":"/wp-content/plugins/bank-media-uploader/uploads/media.png"}
```

The uploaded file lands in `wp-content/plugins/bank-media-uploader/uploads/`
and is served directly, so anything placed there is reachable over HTTP.
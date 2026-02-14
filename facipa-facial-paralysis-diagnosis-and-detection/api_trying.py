from flask import Flask, request, jsonify
from facial_landmarks import *
import os
import base64


app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def felcTespit():
    if request.method == "GET":
        # Browsers hit this with GET; provide a small usage hint instead of 405.
        return jsonify(
            {
                "status": "ok",
                "message": "POST an image to run analysis. Supported: multipart file upload (image=@file.jpg) or data-URI string in form-data/JSON.",
                "example_curl_file": "curl -X POST http://127.0.0.1:5000/ -F \"image=@face.jpg\"",
                "example_curl_data_uri": "curl -X POST http://127.0.0.1:5000/ -H \"Content-Type: application/json\" -d '{\"image\":\"data:image/jpeg;base64,...\"}'",
            }
        )

    # Accept either form-data or JSON.
    image = request.form.get("image")
    if not image and request.is_json:
        payload = request.get_json(silent=True) or {}
        image = payload.get("image")

    # Also accept a direct file upload: `-F "image=@face.jpg"`.
    if not image:
        uploaded = request.files.get("image")
        if uploaded:
            raw = uploaded.read()
            # Keep compatibility with the existing analyzer which expects a data-URI.
            mime = uploaded.mimetype or "image/jpeg"
            image = f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")

    if not image:
        return jsonify({"status": "error", "message": "Image not found"}), 400

    result = resim_analiz(image)
    return jsonify(result)  # return analysis result as JSON


@app.get("/favicon.ico")
def favicon():
    # Avoid noisy 404s in logs when hitting the server from a browser.
    return ("", 204)

if __name__ == "__main__":
    # Allow overriding the listen port, e.g. `PORT=5001 python3 api_trying.py`.
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)

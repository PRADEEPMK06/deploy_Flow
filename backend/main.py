from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="DeployFlow API")

# --- Your existing API routers can go here ---
# app.include_router(your_router)

# Serve React static assets if the static folder exists
if os.path.exists("/app/static"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # Allow API routes to pass through
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        file_path = os.path.join("/app/static", full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("/app/static/index.html")
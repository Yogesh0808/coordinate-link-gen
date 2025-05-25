from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import pytesseract
import cv2
import re
import numpy as np

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# If tesseract is not in PATH
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

def dms_to_decimal(dms_str: str) -> Optional[float]:
    # More flexible regex for DMS strings
    match = re.search(r"(\d{1,3})[^\d]+(\d{1,2})[^\d]+(\d{1,2}(?:\.\d+)?)[^\d]*([NSEW])", dms_str, re.IGNORECASE)
    if not match:
        return None
    deg, min_, sec, direction = match.groups()
    decimal = float(deg) + float(min_) / 60 + float(sec) / 3600
    if direction.upper() in ['S', 'W']:
        decimal *= -1
    return decimal

def extract_coordinates_from_image(image_data: bytes):
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    text = pytesseract.image_to_string(img)

    lat_match = re.search(r'Latitude[:|]?\s*(.+)', text, re.IGNORECASE)
    lon_match = re.search(r'Longitude[:|]?\s*(.+)', text, re.IGNORECASE)

    lat_dms = lat_match.group(1).strip() if lat_match else None
    lon_dms = lon_match.group(1).strip() if lon_match else None

    lat_dec = dms_to_decimal(lat_dms) if lat_dms else None
    lon_dec = dms_to_decimal(lon_dms) if lon_dms else None

    return lat_dms, lon_dms, lat_dec, lon_dec

def get_google_maps_link(lat: float, lon: float) -> str:
    return f"https://maps.google.com/?q={lat},{lon}"

def get_google_earth_link(lat: float, lon: float) -> str:
    return f"https://earth.google.com/web/@{lat},{lon},100a,35y,0h,0t,0r"

def combine_dms_line(lat_dms: str, lon_dms: str) -> str:
    return f"{lat_dms.replace('|', '').strip()} {lon_dms.replace('|', '').strip()}" if lat_dms and lon_dms else ""

@app.post("/extract-coordinates")
async def extract_coordinates(
    image: Optional[UploadFile] = File(None),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None)
):
    if image:
        image_data = await image.read()
        lat_dms, lon_dms, lat_dec, lon_dec = extract_coordinates_from_image(image_data)
        return {
            "source": "image",
            "dms": {
                "latitude": lat_dms.replace("|","") if lat_dms else None,
                "longitude": lon_dms.replace("|","") if lon_dms else None
            },
            "decimal": {
                "latitude": lat_dec,
                "longitude": lon_dec
            },
            "map_links": {
                "google_maps": get_google_maps_link(lat_dec, lon_dec) if lat_dec and lon_dec else None,
                "google_earth": get_google_earth_link(lat_dec, lon_dec) if lat_dec and lon_dec else None
            },
            "dms_line": combine_dms_line(lat_dms, lon_dms)
        }

    elif latitude and longitude:
        lat_dec = dms_to_decimal(latitude)
        lon_dec = dms_to_decimal(longitude)
        return {
            "source": "manual",
            "dms": {
                "latitude": latitude,
                "longitude": longitude
            },
            "decimal": {
                "latitude": lat_dec,
                "longitude": lon_dec
            },
            "map_links": {
                "google_maps": get_google_maps_link(lat_dec, lon_dec) if lat_dec and lon_dec else None,
                "google_earth": get_google_earth_link(lat_dec, lon_dec) if lat_dec and lon_dec else None
            },
            "dms_line": combine_dms_line(latitude, longitude)
        }

    else:
        return JSONResponse(status_code=400, content={"error": "Provide either image or both latitude and longitude."})

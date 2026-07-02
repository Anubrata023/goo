import ee
from config import Config

def get_satellite_thumbnail(lat: float, lng: float) -> str:
    """
    Get a thumbnail URL from Sentinel-2 imagery (free).
    Fallback to a static image if Earth Engine not initialized.
    """
    if Config.DEMO_MODE:
        # Use a static placeholder image
        return "https://storage.googleapis.com/jansaath-static/placeholder_satellite.jpg"
    
    try:
        ee.Initialize(project=Config.EE_PROJECT)
        point = ee.Geometry.Point([lng, lat])
        region = point.buffer(500).bounds()
        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(region)
            .filterDate(ee.Date.now().advance(-30, "day"), ee.Date.now())
            .sort("system:time_start", False)
            .first()
        )
        if image:
            rgb = image.select(["B4", "B3", "B2"])
            url = rgb.getThumbURL({
                "region": region,
                "dimensions": 256,
                "format": "png",
                "min": 0,
                "max": 3000
            })
            return url
        else:
            return "https://storage.googleapis.com/jansaath-static/no_image.jpg"
    except Exception as e:
        print(f"⚠️ Earth Engine error: {e}")
        return "https://storage.googleapis.com/jansaath-static/fallback.jpg"
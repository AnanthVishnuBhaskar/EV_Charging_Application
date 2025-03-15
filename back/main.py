from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LocationRequest(BaseModel):
    latitude: float
    longitude: float


@app.post("/api/charging-stations")
async def get_charging_stations(location: LocationRequest):
    ocm_url = "https://api.openchargemap.io/v3/poi/"
    params = {
        "output": "json",
        "latitude": location.latitude,
        "longitude": location.longitude,
        "distance": 10,  # Distance in kilometers
        "distanceunit": "KM",
        "maxresults": 10,
        # Optionally, include your API key:
        "key": "f25176bd-51e7-443c-bb91-50df6cc5cd51",
    }
    try:
        response = requests.get(ocm_url, params=params)
        response.raise_for_status()
        stations = response.json()
        return {"stations": stations}
    except requests.RequestException as e:
        print("Error fetching data from Open Charge Map:", e)
        raise HTTPException(status_code=500, detail=f"Error fetching data: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

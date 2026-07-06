import os
import uuid
import requests
import json
import tempfile
from fastapi import Request
from fastapi.responses import Response

from config import Config
from agents.intake import triage_complaint, process_voice_complaint, process_photo_complaint
from models.database import save_complaint_to_supabase

def send_whatsapp_message(to_phone: str, message: str) -> dict:
    """
    Send a WhatsApp message via Meta Cloud API.
    """
    url = f"https://graph.facebook.com/v18.0/{Config.WHATSAPP_PHONE_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {Config.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Clean phone number: remove + and spaces
    to_phone_clean = to_phone.replace("+", "").replace(" ", "")
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone_clean,
        "type": "text",
        "text": {"body": message}
    }
    
    print(f"📤 Sending WhatsApp message to: {to_phone_clean}")
    print(f"📤 Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"📤 Status: {response.status_code}")
        print(f"📤 Response body: {response.text}")
        
        if response.status_code == 200:
            print(f"✅ WhatsApp message sent successfully to {to_phone_clean}")
            return response.json()
        else:
            print(f"❌ Send failed with status {response.status_code}")
            return {"error": response.text}
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return {"error": str(e)}

def get_media_url(media_id: str) -> str:
    """
    Get the download URL for a media file from Meta.
    """
    url = f"https://graph.facebook.com/v18.0/{media_id}"
    headers = {
        "Authorization": f"Bearer {Config.WHATSAPP_ACCESS_TOKEN}"
    }
    response = requests.get(url, headers=headers)
    data = response.json()
    return data.get("url")

def download_media(media_url: str) -> bytes:
    """
    Download a media file from Meta.
    """
    headers = {
        "Authorization": f"Bearer {Config.WHATSAPP_ACCESS_TOKEN}"
    }
    response = requests.get(media_url, headers=headers)
    return response.content

async def process_whatsapp_message(message_data: dict) -> dict:
    """
    Process incoming WhatsApp message (text, audio, image).
    """
    print(f"📩 Full message data: {json.dumps(message_data, indent=2)}")
    msg_type = message_data.get("type")
    from_phone = message_data.get("from", "")
    
    # Clean phone
    from_phone = from_phone.replace("+", "").replace(" ", "")
    
    print(f"📱 WhatsApp message from {from_phone}, type: {msg_type}")
    
    # Step 1: Extract content based on type
    if msg_type == "text":
        text = message_data.get("text", {}).get("body", "")
        result = triage_complaint(text)
        
    elif msg_type == "audio":
        # Download audio from Meta
        audio_id = message_data.get("audio", {}).get("id")
        media_url = get_media_url(audio_id)
        audio_content = download_media(media_url)
        
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_content)
            tmp_path = tmp.name
        
        try:
            result = process_voice_complaint(tmp_path)
        finally:
            os.unlink(tmp_path)  # Clean up
            
    elif msg_type == "image":
        # Download image from Meta
        image_id = message_data.get("image", {}).get("id")
        media_url = get_media_url(image_id)
        image_content = download_media(media_url)
        
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(image_content)
            tmp_path = tmp.name
        
        try:
            result = process_photo_complaint(tmp_path)
        finally:
            os.unlink(tmp_path)  # Clean up
            
    else:
        # Unsupported type
        return {"status": "unsupported", "message": f"Unsupported type: {msg_type}"}
    
    # Step 2: Save to Supabase
    complaint_id = str(uuid.uuid4())[:8]
    
    saved = save_complaint_to_supabase({
        "id": complaint_id,
        "user_phone": from_phone,
        "ward": "Chinhat",  # Default - could extract from text
        "raw_text": result.get("summary_en", "WhatsApp complaint"),
        "category": result.get("category"),
        "severity": result.get("severity"),
        "summary_en": result.get("summary_en"),
        "summary_hi": result.get("summary_hi"),
        "sentiment": result.get("sentiment"),
        "scheme_match": result.get("scheme_match", []),
        "estimated_affected": result.get("estimated_affected", 100),
        "priority_score": result.get("priority_score", 50),
    })
    
    if not saved:
        return {"status": "error", "message": "Failed to save complaint"}
    
    # Step 3: Send auto-reply
    reply = f"Dhanyavaad! Shikayat no. {complaint_id} darj ki gayi. Hum 48 ghante mein jawab denge."
    print(f"📤 About to send reply: {reply}")
    
    send_result = send_whatsapp_message(from_phone, reply)
    print(f"📤 Send result: {send_result}")
    
    return {
        "status": "processed",
        "complaint_id": complaint_id,
        "analysis": result,
        "send_result": send_result
    }
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel

from app.youtube_transcript import get_youtube_transcript
from app.summarize_transcript import summarize_transcript

router = APIRouter()


# Request/Response Models
class VideoRequest(BaseModel):
    url: str
    max_length: int = 300


class SummaryResponse(BaseModel):
    summary: str
    word_count: int


# Dependency Injection Example
def validate_url(url: str):
    if not url.startswith("https://youtube.com"):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    return url


@router.post("/summarize", response_model=SummaryResponse)
def generate_summary(
    video_request: VideoRequest,
):
    try:
        # Call your summarizer function here
        # url = validate_url(video_request.url)
        print(f'Received request: {video_request.url}')
        transcript = get_youtube_transcript(youtube_url=video_request.url)
        summary = summarize_transcript(transcript=transcript, max_tokens=video_request.max_length)["summary"]

        return SummaryResponse(
            summary=f'This is a summary of the video at {video_request.url} : {summary}',
            word_count=100
        )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error summarizing video")









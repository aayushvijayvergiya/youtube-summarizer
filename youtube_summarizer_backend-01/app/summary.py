from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session

from app import database
from app.summaryRepository.models import SummaryResponse, VideoRequest, SummarySaveResponse, SummarySaveRequest, \
    SummaryHistoryResponse
from app.summaryRepository.repository import save_summary, get_histories, get_history_by_id
from app.summaryRepository.youtube_transcript import get_youtube_transcript
from app.summaryRepository.summarize_transcript import summarize_transcript

router = APIRouter()

# Dependency Injection Example
def validate_url(url: str):
    if not (url.startswith("https://www.youtube.com") or url.startswith("https://youtu.be")):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    return url


@router.post("/youtube", response_model=SummaryResponse)
def generate_youtube_summary(
    video_request: VideoRequest,
):
    try:
        # Call your summarizer function here
        url = validate_url(video_request.url)
        print(f'Received request: {url}')
        transcript = get_youtube_transcript(youtube_url=url)
        summary = summarize_transcript(transcript=transcript, max_tokens=video_request.max_length)["summary"]

        return SummaryResponse(
            url=url,
            title=f"Video Title Placeholder",  # Replace with actual title if available
            summary=f'This is a summary of the video at {video_request.url} : {summary}',
            word_count=len(summary.split())
        )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error summarizing video")


@router.post("/save", response_model=SummarySaveResponse)
def save_summary_history(
    summary_request: SummarySaveRequest,
    db: Session = Depends(database.get_db)
):
    # Placeholder for actual implementation
    # Save the summary to a database or file
    print(f"Saving summary for URL: {summary_request.url}")
    saved_summary = save_summary(db, {
        "title": summary_request.title,
        "summary": summary_request.summary,
        "metadata": {
            "key": "url",
            "value": summary_request.url
        }
    })
    return SummarySaveResponse(
        message=f"Summary saved for {summary_request.url}"
    )


@router.get("/history", response_model=SummaryHistoryResponse)
def get_saved_histories(db: Session = Depends(database.get_db)):
    # Placeholder for actual implementation
    summaries = get_histories(db)
    mapped_summaries = list(map(lambda x: {
        "id": x.id,
        "title": x.title,
        "url": x.summary_metadata.value,
        "summary": x.summary
    }, summaries))

    print(f"Retrieved summaries: {mapped_summaries[0]['summary']} - {mapped_summaries[0]['title']} - {mapped_summaries[0]['url']}")
    return SummaryHistoryResponse(
        histories=mapped_summaries
    )


@router.get("/history/{history_id}", response_model=SummaryHistoryResponse)
def get_summary_by_id(history_id: int, db: Session = Depends(database.get_db)):
    print(f'Retrieving summary with ID: {history_id}')
    summaries = get_history_by_id(db, history_id)
    mapped_summaries = list(map(lambda x: {
        "id": x.id,
        "title": x.title,
        "url": x.summary_metadata.value,
        "summary": x.summary
    }, summaries))

    print(f"Retrieved summaries: {mapped_summaries[0]['summary']} - {mapped_summaries[0]['title']} - {mapped_summaries[0]['url']}")
    return SummaryHistoryResponse(
        histories=mapped_summaries
    )









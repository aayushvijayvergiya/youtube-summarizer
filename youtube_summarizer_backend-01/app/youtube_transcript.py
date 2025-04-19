from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from urllib.parse import urlparse, parse_qs


def get_youtube_transcript(youtube_url: str) -> str:
    """
    Extract English transcript from a YouTube video URL.

    Args:
        youtube_url (str): Full YouTube video URL

    Returns:
        str: Formatted transcript text in English

    Raises:
        ValueError: If video ID cannot be extracted or transcript is unavailable
    """
    try:
        # Extract video ID from URL
        video_id = extract_video_id(youtube_url)

        # Get available transcripts
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # Try to get English transcript
        try:
            transcript = transcript_list.find_transcript(['en'])
        except:
            # If English not available, get whatever is available and translate
            transcript = transcript_list.find_transcript(['en-US', 'en-GB'])
            if not transcript:
                transcript = transcript_list.find_generated_transcript(['en'])
                if not transcript:
                    # Get any available transcript and translate to English
                    transcript = transcript_list.find_generated_transcript()
                    transcript = transcript.translate('en')

        # Get the transcript data
        transcript_data = transcript.fetch()

        # Format the transcript as plain text
        formatter = TextFormatter()
        formatted_transcript = formatter.format_transcript(transcript_data)

        return formatted_transcript

    except Exception as e:
        raise ValueError(f"Failed to retrieve transcript: {str(e)}")


def extract_video_id(youtube_url: str) -> str:
    """
    Extract the video ID from a YouTube URL.

    Args:
        youtube_url (str): YouTube URL in various possible formats

    Returns:
        str: YouTube video ID

    Raises:
        ValueError: If video ID cannot be extracted
    """
    # Handle different URL formats
    parsed_url = urlparse(youtube_url)

    # Format: youtube.com/watch?v=VIDEO_ID
    if parsed_url.netloc in ('youtube.com', 'www.youtube.com') and parsed_url.path == '/watch':
        query_params = parse_qs(parsed_url.query)
        if 'v' in query_params:
            return query_params['v'][0]

    # Format: youtu.be/VIDEO_ID
    elif parsed_url.netloc == 'youtu.be':
        return parsed_url.path.lstrip('/')

    # Format: youtube.com/embed/VIDEO_ID
    elif (parsed_url.netloc in ('youtube.com', 'www.youtube.com') and
          parsed_url.path.startswith('/embed/')):
        return parsed_url.path.split('/embed/')[1]

    raise ValueError(f"Could not extract video ID from URL: {youtube_url}")
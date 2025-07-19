from youtube_transcript_api import YouTubeTranscriptApi
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

        print(f"Extracted video ID: {video_id}")

        # Get available transcripts (without proxy)
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # Try to get English transcript
        try:
            transcript = transcript_list.find_transcript(['en'])
        except:
            # If English not available, get whatever is available and translate
            try:
                transcript = transcript_list.find_transcript(['en-US', 'en-GB'])
            except:
                try:
                    transcript = transcript_list.find_generated_transcript(['en'])
                except:
                    # Get any available transcript and translate to English
                    available_transcripts = list(transcript_list)
                    if available_transcripts:
                        transcript = available_transcripts[0].translate('en')
                    else:
                        raise ValueError("No transcripts available for this video")

        # Get the transcript data
        transcript_data = transcript.fetch()

        # Format the transcript as plain text
        formatted_transcript = ""
        for entry in transcript_data:
            formatted_transcript += entry['text'] + " "

        return formatted_transcript.strip()

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

    print(f'Parsed URL: {parsed_url}')

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
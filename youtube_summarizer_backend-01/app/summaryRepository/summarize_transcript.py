from langchain_core.prompts import PromptTemplate
from langchain_openai.chat_models import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
from typing import Dict, Optional, List, Any


def create_summarizer(
        provider: str = "openai",
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.2
) -> callable:
    """
    Create a function to summarize YouTube video transcripts.

    Args:
        provider: LLM provider ("openai" or "anthropic")
        api_key: API key for the provider
        model: Model name to use (provider-specific)
        max_tokens: Maximum tokens for output
        temperature: Temperature for generation

    Returns:
        callable: A function that takes transcript text and summarization options
    """
    # Configure model
    if provider.lower() == "openai":
        if api_key:
            os.environ["OPENAI_API_KEY"] = api_key
        llm = ChatOpenAI(
            model=model or "gpt-3.5-turbo",
            temperature=temperature,
            max_tokens=max_tokens
        )
    # elif provider.lower() == "anthropic":
    #     if api_key:
    #         os.environ["ANTHROPIC_API_KEY"] = api_key
    #     llm = ChatAnthropic(
    #         model=model or "claude-3-sonnet-20240229",
    #         temperature=temperature,
    #         max_tokens=max_tokens
    #     )
    else:
        raise ValueError(f"Unsupported provider: {provider}")

    # Set up text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=4000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    # Define prompts for different stages
    map_prompt_template = """
    You are a YouTube video summarizer that creates concise, informative summaries.

    Below is a segment of a transcript from a YouTube video:

    {text}

    Identify the key points, main ideas, and important details from this transcript segment.
    Ignore filler words, repetitions, and tangential information.
    """

    combine_prompt_template = """
    You are a YouTube video summarizer that creates concise, informative summaries.

    Below are the extracted key points from different segments of a YouTube video transcript:

    {text}

    Create a coherent, well-structured summary that captures the main points and important details of the video.
    Focus on delivering maximum value to someone who hasn't watched the video.
    Include any important conclusions, recommendations, or actionable insights.

    {format_instructions}
    """

    # Create LCEL chains
    map_prompt = PromptTemplate.from_template(map_prompt_template)

    map_chain = (
            {"text": RunnablePassthrough()}
            | map_prompt
            | llm
            | StrOutputParser()
    )

    # Function to get format instructions based on format_type
    def get_format_instructions(format_type):
        if format_type == "bullet":
            return "Format your summary as a bulleted list of key points."
        elif format_type == "detailed":
            return "Provide a detailed summary with sections for Introduction, Main Content, and Conclusion."
        else:  # paragraph
            return "Your summary should be in paragraph form, around 250-300 words."

    # Function to summarize
    def summarize(
            transcript: str,
            format_type: str = "paragraph"
    ) -> Dict[str, Any]:
        """
        Summarize a YouTube video transcript.

        Args:
            transcript: The transcript text
            format_type: Format type ("paragraph", "bullet", or "detailed")

        Returns:
            Dict[str, Any]: Dictionary with summary and metadata
        """
        if not transcript or len(transcript.strip()) < 100:
            raise ValueError("Transcript is too short or empty")

        # Split text into chunks
        chunks = text_splitter.split_text(transcript)

        # Summarize each chunk
        chunk_summaries = []
        for chunk in chunks:
            chunk_summary = map_chain.invoke(chunk)
            chunk_summaries.append(chunk_summary)

        # If only one chunk, format it according to the requested format
        if len(chunks) == 1:
            format_instructions = get_format_instructions(format_type)

            combine_prompt = PromptTemplate.from_template(
                combine_prompt_template
            )

            final_chain = (
                    {"text": lambda _: chunk_summaries[0], "format_instructions": lambda _: format_instructions}
                    | combine_prompt
                    | llm
                    | StrOutputParser()
            )

            final_summary = final_chain.invoke({})
        else:
            # Combine all chunk summaries
            combined_summaries = "\n\n".join(chunk_summaries)

            # Create final summary with proper format
            format_instructions = get_format_instructions(format_type)

            combine_prompt = PromptTemplate.from_template(
                combine_prompt_template
            )

            final_chain = (
                    {"text": lambda _: combined_summaries, "format_instructions": lambda _: format_instructions}
                    | combine_prompt
                    | llm
                    | StrOutputParser()
            )

            final_summary = final_chain.invoke({})

        # Calculate approximate word count
        word_count = len(final_summary.split())

        return {
            "summary": final_summary,
            "word_count": word_count,
            "format": format_type,
            "chunk_count": len(chunks)
        }

    return summarize


# Usage wrapper function
def summarize_transcript(
        transcript: str,
        provider: str = "openai",
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        format_type: str = "paragraph",
        max_tokens: int = 1000
) -> Dict[str, Any]:
    """
    Summarize a YouTube video transcript.

    Args:
        transcript: The transcript text
        provider: LLM provider ("openai" or "anthropic")
        api_key: API key for the provider
        model: Model name to use
        format_type: Format type ("paragraph", "bullet", or "detailed")
        max_tokens: Maximum tokens for output

    Returns:
        Dict[str, Any]: Dictionary with summary and metadata
    """

    print('Transcript received')

    summarizer = create_summarizer(
        provider=provider,
        api_key=api_key,
        model=model,
        max_tokens=max_tokens
    )

    summary_dict = summarizer(transcript, format_type)

    print('Summary Received')
    print('Word Count:', summary_dict['word_count'])

    return summary_dict
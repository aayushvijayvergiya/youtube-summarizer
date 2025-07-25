from sqlalchemy.orm import Session

from app.summaryRepository import models

def save_summary(db: Session, summary):
    """
    Save the summary to summary table.
    """
    print(f"Saving summary: {summary['title']} - {summary['summary']} - {summary['metadata']['url']}")
    try:
        summaries = models.Summary()
        summaries.title = summary['title']
        summaries.summary = summary['summary']
        summaries.summary_metadata = models.SummaryMetadata()
        summaries.summary_metadata.url = summary['metadata']['url']
        db.add(summaries)
        db.commit()
        db.refresh(summaries)
        return summaries
    except Exception as e:
        db.rollback()
        raise e


def get_histories(db: Session):
    """
    Get the summary histories from summary table.
    """
    summaries = db.query(models.Summary).all()
    return summaries


def get_history_by_id(db: Session, id: int):
    """
    Get the summary history by id from summary table.
    """
    summaries = db.query(models.Summary).filter(models.Summary.id == id).all()
    return summaries

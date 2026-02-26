import sys
sys.path.append('.')
from database import SessionLocal
import crud
import schemas

db = SessionLocal()
try:
    summary = crud.get_analytics_summary(db)
    # Try to validate with Pydantic
    serialized = schemas.AnalyticsSummary.model_validate(summary)
    print("Serialized successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()

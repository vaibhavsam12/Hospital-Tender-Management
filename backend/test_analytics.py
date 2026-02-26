import sys
sys.path.append('.')
from database import SessionLocal
import crud
db = SessionLocal()
try:
    print(crud.get_analytics_summary(db))
except Exception as e:
    import traceback
    traceback.print_exc()

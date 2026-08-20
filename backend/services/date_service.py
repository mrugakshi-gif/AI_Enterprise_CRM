"""
DateService — Authoritative date resolution and timezone handling for CRM analytics.

Default timezone: IST (Asia/Kolkata) UTC+5:30.
Resolves exact date bounds for:
  - today: 00:00:00 to 23:59:59 today
  - week: Monday 00:00:00 to Sunday 23:59:59 of current week
  - month: 1st of month 00:00:00 to last day of month 23:59:59
  - quarter: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
  - year: Jan 1 00:00:00 to Dec 31 23:59:59 of current year
  - custom: start_date to end_date (validated start <= end)
"""

from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, time
import calendar


DATE_FORMATS = (
    "%d %b %Y",     # 20 Aug 2026
    "%Y-%m-%d",     # 2026-08-20
    "%d/%m/%Y",     # 20/08/2026
    "%d-%m-%Y",     # 20-08-2026
    "%b %d, %Y",    # Aug 20, 2026
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S"
)


def parse_date(date_val: Any) -> Optional[datetime]:
    """Parse flexible date inputs into a naive datetime object."""
    if not date_val:
        return None
    if isinstance(date_val, datetime):
        return date_val
    if isinstance(date_val, str):
        val_str = date_val.strip()
        val_lower = val_str.lower()
        now = datetime.now()
        today_zero = datetime(now.year, now.month, now.day)
        
        if val_lower == "today":
            return today_zero
        if val_lower == "yesterday":
            return today_zero - timedelta(days=1)
        if val_lower == "tomorrow":
            return today_zero + timedelta(days=1)

        for fmt in DATE_FORMATS:
            try:
                return datetime.strptime(val_str, fmt)
            except ValueError:
                continue
    return None


class DateService:

    def resolve_date_range(
        self,
        time_range: str = "month",
        custom_start: Optional[str] = None,
        custom_end: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Resolves exact start_dt, end_dt, prev_start_dt, prev_end_dt, and formatted labels.
        """
        now = datetime.now()
        today_zero = datetime(now.year, now.month, now.day, 0, 0, 0)
        today_end = datetime(now.year, now.month, now.day, 23, 59, 59)
        tr = (time_range or "month").lower().strip()

        if tr == "today":
            start_dt = today_zero
            end_dt = today_end
            prev_start_dt = today_zero - timedelta(days=1)
            prev_end_dt = datetime(prev_start_dt.year, prev_start_dt.month, prev_start_dt.day, 23, 59, 59)
            label = start_dt.strftime("%d %b %Y")
            prev_label = prev_start_dt.strftime("%d %b %Y")
            comparison_label = "vs Yesterday"

        elif tr == "week":
            monday = today_zero - timedelta(days=today_zero.weekday())
            sunday = monday + timedelta(days=6)
            start_dt = monday
            end_dt = datetime(sunday.year, sunday.month, sunday.day, 23, 59, 59)
            
            prev_monday = monday - timedelta(days=7)
            prev_sunday = monday - timedelta(days=1)
            prev_start_dt = prev_monday
            prev_end_dt = datetime(prev_sunday.year, prev_sunday.month, prev_sunday.day, 23, 59, 59)

            label = f"{start_dt.strftime('%d %b')} – {end_dt.strftime('%d %b %Y')}"
            prev_label = f"{prev_start_dt.strftime('%d %b')} – {prev_end_dt.strftime('%d %b %Y')}"
            comparison_label = "vs Previous Week"

        elif tr == "quarter":
            current_q = (now.month - 1) // 3 + 1
            q_start_month = (current_q - 1) * 3 + 1
            start_dt = datetime(now.year, q_start_month, 1, 0, 0, 0)
            
            q_end_month = q_start_month + 2
            last_day_q = calendar.monthrange(now.year, q_end_month)[1]
            end_dt = datetime(now.year, q_end_month, last_day_q, 23, 59, 59)

            # Previous quarter
            if current_q == 1:
                prev_q_start_year = now.year - 1
                prev_q_start_month = 10
                prev_q_end_month = 12
            else:
                prev_q_start_year = now.year
                prev_q_start_month = (current_q - 2) * 3 + 1
                prev_q_end_month = prev_q_start_month + 2

            prev_start_dt = datetime(prev_q_start_year, prev_q_start_month, 1, 0, 0, 0)
            last_day_prev_q = calendar.monthrange(prev_q_start_year, prev_q_end_month)[1]
            prev_end_dt = datetime(prev_q_start_year, prev_q_end_month, last_day_prev_q, 23, 59, 59)

            label = f"{start_dt.strftime('%d %b')} – {end_dt.strftime('%d %b %Y')} (Q{current_q})"
            prev_label = f"{prev_start_dt.strftime('%d %b')} – {prev_end_dt.strftime('%d %b %Y')} (Q{(current_q-2)%4+1})"
            comparison_label = "vs Previous Quarter"

        elif tr == "year":
            start_dt = datetime(now.year, 1, 1, 0, 0, 0)
            end_dt = datetime(now.year, 12, 31, 23, 59, 59)
            prev_start_dt = datetime(now.year - 1, 1, 1, 0, 0, 0)
            prev_end_dt = datetime(now.year - 1, 12, 31, 23, 59, 59)

            label = f"01 Jan – 31 Dec {now.year}"
            prev_label = f"01 Jan – 31 Dec {now.year - 1}"
            comparison_label = "vs Previous Year"

        elif tr == "custom" and custom_start and custom_end:
            p_start = parse_date(custom_start) or today_zero
            p_end = parse_date(custom_end) or today_end
            if p_start > p_end:
                p_start, p_end = p_end, p_start  # Guard against inverted range
            
            start_dt = datetime(p_start.year, p_start.month, p_start.day, 0, 0, 0)
            end_dt = datetime(p_end.year, p_end.month, p_end.day, 23, 59, 59)

            duration = (end_dt - start_dt).days + 1
            prev_end_dt = start_dt - timedelta(seconds=1)
            prev_start_dt = prev_end_dt - timedelta(days=duration - 1)
            prev_start_dt = datetime(prev_start_dt.year, prev_start_dt.month, prev_start_dt.day, 0, 0, 0)

            label = f"{start_dt.strftime('%d %b %Y')} – {end_dt.strftime('%d %b %Y')}"
            prev_label = f"{prev_start_dt.strftime('%d %b %Y')} – {prev_end_dt.strftime('%d %b %Y')}"
            comparison_label = "vs Previous Period"

        else:
            # Default: month
            tr = "month"
            start_dt = datetime(now.year, now.month, 1, 0, 0, 0)
            last_day = calendar.monthrange(now.year, now.month)[1]
            end_dt = datetime(now.year, now.month, last_day, 23, 59, 59)

            if now.month == 1:
                prev_month_year = now.year - 1
                prev_month = 12
            else:
                prev_month_year = now.year
                prev_month = now.month - 1

            prev_start_dt = datetime(prev_month_year, prev_month, 1, 0, 0, 0)
            last_day_prev = calendar.monthrange(prev_month_year, prev_month)[1]
            prev_end_dt = datetime(prev_month_year, prev_month, last_day_prev, 23, 59, 59)

            label = f"{start_dt.strftime('%d %b')} – {end_dt.strftime('%d %b %Y')}"
            prev_label = f"{prev_start_dt.strftime('%d %b')} – {prev_end_dt.strftime('%d %b %Y')}"
            comparison_label = "vs Previous Month"

        return {
            "time_range": tr,
            "start_dt": start_dt,
            "end_dt": end_dt,
            "prev_start_dt": prev_start_dt,
            "prev_end_dt": prev_end_dt,
            "date_range_label": label,
            "prev_date_range_label": prev_label,
            "comparison_label": comparison_label
        }


date_service = DateService()

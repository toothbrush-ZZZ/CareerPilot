from typing import List, Dict, Optional

class NudgeAgent:
    def generate_nudges(self, stats: Dict, recent_jobs: List[Dict]) -> List[str]:
        """
        Generates proactive AI nudges based on user activity.
        """
        nudges = []
        
        # 1. No applications this week
        if stats.get("this_week", 0) == 0:
            job_suggestions = ", ".join([j.get("job_title", j.get("role", "Unknown")) for j in recent_jobs[:3]])
            if job_suggestions:
                nudges.append(f"You haven't applied this week! Check these matches: {job_suggestions}")
            else:
                nudges.append("You haven't applied this week! Try searching for some new roles today.")

        # 2. Streak reminder
        if stats.get("total_applications", 0) > 0 and stats.get("this_week", 0) < 3:
            nudges.append("Consistency is key. Aim for 3-5 applications a week to stay ahead.")

        # 3. Goal progress
        goals_done = stats.get("goals_completed", 0)
        goals_total = stats.get("goals_total", 0)
        if goals_total > 0 and goals_done < goals_total:
            nudges.append(f"You've completed {goals_done}/{goals_total} goals. Keep checking them off!")
        elif goals_total == 0:
            nudges.append("Set a goal for this week to stay focused on your career progress.")

        return nudges[:3]

"""Scheduler for automatic vote deletions"""

import sys
from datetime import timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone

from ..models import Vote
from ..views import execute_vote


def delete_votes():
    """Delete votes older than day"""
    time = timezone.now() - timedelta(days=1)
    arch_time = timezone.now() - timedelta(days=7)
    expired_votes = Vote.objects.filter(time_created__lt=time)
    count = 0
    for vote in expired_votes:
        try:
            if vote.type == "architect" and vote.time_created > arch_time:
                continue
            execute_vote(vote)
            count += 1
        except Exception as e:  # pylint: disable=broad-exception-caught
            print("Couldn't delete the vote: ", e)
    print(f"Deleted {count} votes")


scheduler = BackgroundScheduler()


def start():
    """Start the scheduler"""
    if not scheduler.running:
        scheduler.add_job(
            delete_votes,
            "interval",
            minutes=1,
            name="delete_votes",
            replace_existing=True,
        )
        scheduler.start()
        print("Scheduler for votes started", file=sys.stdout)
